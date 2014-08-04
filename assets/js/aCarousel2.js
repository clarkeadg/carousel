function aCarousel(jcont,opts) {
	/*
		Dependencies
			- jQuery

		Notes
			- Assumes items have set dimensions
			- Assumes items have equal dimensions

		Improvements
			- To keep things lightweight it would be better
				to have a moving container rather than updating all
				individual elements
	*/
	
	var config = {
		defaults: {
			margin: 6,
			move: null, // null moves one page
			items: null,
			animate: {
				duration: 300
			},
			btns: {
				prev: {
					text: 'Prev'
				},
				next: {
					text: 'Next'
				}
			}
		}
	};

	var z = this,
		init,findItems,build,setUpButtons,styleItems,createItem,itemSpace,
		placeItems,makePosCSS,move,getBounds,
		changeOffset,appendItem,removeItem,focusOn,
		calculateNumInView,getElementRealDims;
	z.$ = {};
	z.$.cont = jcont;
	z.items = [];
	z.offset = {
		x: 0,
		y: 0
	};
	z.opts = $.extend(true,{},config.defaults,opts);

	/* Public Methods */

	z.next = function(num){
		num = typeof(num) == 'number' ? num : z.opts.move;
		move(1,num);
	};

	z.prev = function(num){
		num = typeof(num) == 'number' ? num : z.opts.move;
		move(-1,num);
	};

	z.appendItem = function(item,index){
		return appendItem(item,index);
	};

	z.removeItem = function(index){
		return removeItem(index);
	};

	z.focusOn = function(selector){
		focusOn(selector);
	};

	z.getBounds = function(){
		return getBounds();
	};

	init = function(){
		findItems();
		build();
	};

	findItems = function(){
		var jcont = z.$.wrap ? z.$.wrap : z.$.cont;
		if (typeof(z.opts.items) == 'string') {
			z.$.items = jcont.find(z.opts.items);
		} else {
			z.$.items = jcont.children();
		}
		console.log(z.$.items)
	};

	build = function(){
		// wrap
		z.$.wrap = $('<div></div>').css({
			position: 'relative',
			overflow: 'hidden',
			height: getElementRealDims(z.$.cont).h+'px'
		}).appendTo(z.$.cont);
		z.$.wrap.append(z.$.items);

		// set default css for items
		styleItems(z.$.items);

		// create items
		z.$.items.each(function(index){
			z.items.push(createItem($(this),index));
		});

		// place
		placeItems({
			duration: 0
		});

		// set up buttons
		setUpButtons();
	};

	setUpButtons = function(){
		var k,jbtn,txt;
		if (typeof(z.opts.btns) == 'object') {
			for (k in z.opts.btns) {
				jbtn = null;
				if (z.opts.btns[k].jquery) {
					jbtn = z.opts.btns[k];
				} else if (typeof(z.opts.btns[k]) == 'object') {
					jbtn = $('<a href="#">'+(z.opts.btns[k].text||'')+'</a>');
					z.$.cont.append(jbtn);
				}
				if (!jbtn) {
					continue;
				}
				jbtn.addClass('btn btn-'+k);
				(function(){
					var onclick = null;
					switch (k) {
						case 'next': onclick = z.next; break;
						case 'prev': onclick = z.prev; break;
					}
					if (onclick) {
						jbtn.bind('click',function(e){
							e.preventDefault();
							onclick();
						});
					}
				})();
			}
		}
	};

	styleItems = function(jitems){
		jitems.css({
			position: 'absolute'
		});
	};

	createItem = function(jitem,index){
		var dim = getElementRealDims(jitem);
		return {
			$: jitem,
			width: dim.w,
			height: dim.h,
			x: index*(itemSpace()),
			y: 0
		};
	};

	itemSpace = function(){
		var space = 0;
		if (z.items[0]) {
			space = z.items[0].width+z.opts.margin;
		}
		return space;
	};

	placeItems = function(animate,index){
		var items,i,c;
		if (!animate) {
			animate = z.opts.animate;
		}
		items = typeof(index) == 'number' ? [z.items[index]] : z.items;
		for (i=0,c=items.length;i<c;++i) {
			items[i].$.animate(makePosCSS(items[i]),animate);
		}
	};

	makePosCSS = function(item){
		return {
			left: (item.x + z.offset.x)+'px',
			top: (item.y + z.offset.y)+'px'
		};
	};

	move = function(dir,num){
		var bounds;
		num = typeof(num) == 'number' ? num : calculateNumInView();
		if (z.items[0]) {
			changeOffset(-1*dir*num*itemSpace());
		}
		placeItems();
	};

	getBounds = function(){
		var bounds = {
			x: [0,0]
		},
		window_width = z.$.wrap.width(),
		all_items_width = z.items.length*itemSpace() - z.opts.margin;
		if (all_items_width < window_width) {
			all_items_width = window_width;
		}
		if (z.items[0]) {
			bounds.x = [
				-1 * (all_items_width - window_width),
				0
			];
		}
		return bounds;
	};

	changeOffset = function(amount){
		var bounds = getBounds();
		z.offset.x += amount;
		if (z.offset.x < bounds.x[0]) {
			z.offset.x = bounds.x[0];
		} else if (z.offset.x > bounds.x[1]) {
			z.offset.x = bounds.x[1];
		}
	};

	appendItem = function(item,index){
		var this_index,i,c;
		if (typeof(item) == 'string') {
			item = $(item);
		}
		if (typeof(index) != 'number' || index >= z.items.length || index < 0) {
			index = z.items.length-1;
		}
		if (index < 0) {
			index = -1;
		}
		styleItems(item);
		if (index >= 0) {
			this_index = index+1;
			z.$.items.eq(index).after(item);
		} else {
			this_index = 0;
			z.$.wrap.append(item);
		}
		findItems();
		z.items.splice(this_index,0,createItem(item,this_index));
		item.css(makePosCSS(z.items[this_index]));
		for (i=this_index+1,c=z.items.length;i<c;++i) {
			z.items[i].x += itemSpace();
		}
		changeOffset(0);
		placeItems();
		return this_index;
	};

	removeItem = function(index){
		var i,c;
		if (typeof(index) == 'string') {
			index = z.$.items.index(z.$.items.filter(index));
		}
		if (index < 0 || index >= z.items.length) {
			return false;
		}
		z.$.items.eq(index).remove();
		findItems();
		z.items.splice(index,1);
		for (i=index,c=z.items.length;i<c;++i) {
			z.items[i].x -= itemSpace();
		}
		changeOffset(0);
		placeItems();
		return true;
	};

	focusOn = function(selector){
		var index;
		if (typeof(selector) == 'number') {
			index = selector;
		} else {
			index = z.$.items.index(z.$.items.filter($(selector)));
		}
		if (index >= 0 && index < z.items.length) {
			changeOffset( -1*index*itemSpace() - z.offset.x );
			placeItems();
		}
	};

	calculateNumInView = function(){
		var num = 0,
			window_width = z.$.wrap.width();
		if (z.items[0]) {
			num = Math.floor( window_width/itemSpace() );
		}
		return num;
	};

	getElementRealDims = function(elm,include_margin){
		var e,i,c,
			h = elm.height(),
			w = elm.width(),
			hc = ['padding-top','padding-bottom','border-top-width','border-bottom-width'],
			wc = ['padding-left','padding-right','border-left-width','border-right-width'],
			re = /[^0-9.]/g;
		if (include_margin) {
			hc = hc.concat(['margin-top','margin-bottom']);
			wc = wc.concat(['margin-left','margin-right']);
		}
		for (i=0,c=hc.length;i<c;++i) {
			if (e = (elm.css(hc[i]) || '').replace(re,'')) h += +e;
		}
		for (i=0,c=wc.length;i<c;++i) {
			if (e = (elm.css(wc[i]) || '').replace(re,'')) w += +e;
		}
		return {h:h,w:w};
	};

	init();
	

}
