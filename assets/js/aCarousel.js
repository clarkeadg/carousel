aCarousel = {
	config: {
		defaults: {
			view: 'normal',
			max: 10
		},
		paginate: false
	},
	$: {},
	instances: {},
	last_id: 0,	
	widgetize: function(jcont,opts){		
		var z = this;
		var id = z.last_id++;
		z.instances[id] = {
			$:{cont:jcont},
			opts: $.extend({},z.config.defaults,opts)
		};		
		z.insertWidget(id);
	},
	insertWidget: function(id) {
		var z = this;

		var instance = z.instances[id];	
		instance.id = id;
		
		var itemsHTML = instance.$.cont.clone(true);		

		var myHTML = '<div class="cItems">'
			+ (instance.opts.title ? '<div class="cHeader"><a href="#" class="cTitle">'+instance.opts.title+'</a></div>' : '')
			+ '<div class="cItems-inner">'
				+ '<a class="prev"></a>'
					+ '<div class="cItems-content-outer">'
						+ '<div class="cItems-content">'
						+ '</div>'
					+ '</div>'
				+ '<a class="next"></a>'
			+ '</div>'
		+ '</div>';		

		instance.$.cont.html(myHTML);
		instance.$.cont.attr('x-data-id',id).addClass('aCarousel aCarousel-id-'+instance.opts.cid);
		instance.$.cont.current_item = 0;

		instance.$.cont.find('.cItems-content').append(itemsHTML);

		z.renderView(instance);

		/*if (instance.opts.expanded == true) {
			instance.$.cont.find('.cItems-inner').css('display','block');
			instance._visible = false;
			Trends.getTrends(id,instance); 
		}
		else {
			instance.$.cont.find('.cItems-inner').css('display','none');
			instance._visible = true;
		}
		
		instance.$.cont.find('a.cTitle').bind('click',function(e){
			e.preventDefault();
			if (instance.opts.collapseable) {
				var t = $(this).parent().parent();
				if (instance._visible == true) {
					t.find('.cItems-inner').slideDown();
					instance._visible = false;
					if (instance.opts.expanded == false) {
						instance.opts.expanded = true;
						Trends.getTrends(id,instance);
					}
				} else {
					t.find('.cItems-inner').slideUp();
					instance._visible = true;
				}
			}
		});	*/	
	},
	renderView: function(instance) {
		var z = this,
		item_dimensions,
		item_spacing,
		scale_amount,
		positionX,
		positionY,
		itemWidth,
		itemHeight,
		itemCenterHTML,
		itemContainer,
		sliderWidth,
		last_item,
		slide_distance,
		itemNumber,
		itemInfo = {};

		itemContainer = instance.$.cont.find('.cItems-content');
		instance.isAnimating = false;		
		myZ = 100;
		itemNumber = 0;
		instance.$.cont.find('.cItem').each(function(index) {

			item_dimensions = z.getElementRealDims($(this));
			itemNumber++;

			switch(instance.opts.view) {		
				case '3d':
					//instance.item_spacing = 50;	
					instance.scale_amount = 0.2;					
					slide_distance = 1;	
					if (index == 0) {
						instance.first_item = instance.$.cont.find(".cItem:eq(0)");
						instance.first_item_dimensions = z.getElementRealDims(instance.first_item);						
						instance.first_itemX = instance.first_item.position().top + (instance.first_item_dimensions.w/2);
						instance.first_itemY = instance.first_item.position().left + (instance.first_item_dimensions.h/2);	
					}
					itemInfo = z.getItem(instance,index);					
					if (itemNumber > 1) {
						$(this).addClass("cItem2");
						$(this).find('.cItemName').addClass("cItemName2");
						$(this).find('.cItemRank').addClass("cItemRank2");
						$(this).find('.cItemButton').addClass("cItemButton2");
					}
				break;
				case 'normal':					
					item_spacing = instance.opts.item_spacing;	
					slide_distance = instance.opts.slide_distance;	
					itemInfo.width = item_dimensions.w;
					itemInfo.height = item_dimensions.h;
					itemInfo.x = (itemInfo.width/2) + (index * itemInfo.width) + (index * item_spacing);
					itemInfo.y = itemInfo.height/2;	
					//instance.$.cont.find('.prev').css('visibility','hidden');				
				break;
				default:
				break;
			}
			
			//For Testing
			/*itemCenterHTML = '<div class="itemCenter-'+index+'" >x</div>';
			itemContainer.append(itemCenterHTML);
			itemContainer.find('.itemCenter-'+index).css('position','absolute');
			itemContainer.find('.itemCenter-'+index).css('left',itemInfo.x+'px');
			itemContainer.find('.itemCenter-'+index).css('top',itemInfo.y+'px');*/
			//End For Testing

			z.renderItem($(this),itemInfo);	
			myZ--;
			if (instance.opts.view == '3d') {
				$(this).css('z-index',myZ);
			}	
		});

		//SET WIDTH OF ITEMS CONTENT HOLDER
		sliderWidth = positionX + (itemWidth/2) + item_spacing;
		instance.$.cont.find('.cItems-content').css('width',sliderWidth);
		
		//SLIDE FORWARD
		instance.$.cont.find('.next').bind('click',function(e) {			
			e.preventDefault();

			var scroll_forward = function() {
				if (((instance.$.cont.current_item + slide_distance) < (instance.opts.max)) && instance.isAnimating == false)	{	
					z.slide(instance,'forward',slide_distance);				
				}
			}	

			if (z.config.paginate) {
				if (instance.opts.view == '3d') {
					if (((instance.$.cont.current_item) < (instance.opts.max-10)) && instance.isAnimating == false)	{	
						z.slide(instance,'forward',slide_distance);
					} else {
						//alert('get more items');
						var options = {
							option_id: instance.opts.option_id,
							offset: instance.opts.max										
						}
						Trends.getMoreTrends(options,instance.$.cont,instance.id);	
						z.slide(instance,'forward',slide_distance);			
					}
				} else {
					scroll_forward();
				}
			} else {
				scroll_forward();
			}
						
		});

		//SLIDE BACKWARD
		instance.$.cont.find('.prev').bind('click',function(e) {
			e.preventDefault();
			if (((instance.$.cont.current_item - slide_distance) > -1) && instance.isAnimating == false) {
				z.slide(instance,'backward',slide_distance);
			} 

		});
	},
	addNewItems: function(id) {
		var z = this, new_item, move_item, item_info;

		//console.log('addNewItems');
		
		var myZ = 100;	

		var instance = z.instances[id];		

		instance.$.cont.find('.cItem').each(function(index) {

			myZ--;

			if (index > (instance.opts.max-1)) {

				move_item = instance.$.cont.find('.cItem:eq('+(index)+')');

				new_item = move_item.clone(true);
				move_item.remove();

				instance.$.cont.find('.cItems-content').append(new_item);

				new_item.addClass("cItem2");
				new_item.find('.cItemName').addClass("cItemName2");
				new_item.find('.cItemRank').addClass("cItemRank2");
				new_item.find('.cItemButton').addClass("cItemButton2");

				new_item.find('.cItemRank').html(index+1);

				item_info = z.getItem(instance,index-1);
				z.renderItem(new_item,item_info);

				if (instance.opts.view == '3d') {
					new_item.css('z-index',myZ);
				}

			} else {
				if (instance.opts.view == '3d') {
					instance.$.cont.find('.cItem:eq('+(index)+')').css('z-index',myZ);
				}
			}

		});

		instance.opts.max+= 10;	
	},
	renderItem: function(item,itemInfo) {
		var z = this;	
		itemInfo.x = itemInfo.x - (itemInfo.width/2);
		itemInfo.y = itemInfo.y - (itemInfo.height/2);
		item.css('width',itemInfo.width+'px');
		item.css('height',itemInfo.height+'px');
		item.css('left',itemInfo.x+'px');
		item.css('top',itemInfo.y+'px');
	},	
	slideTo: function(id) {
		var z = this;
		var instance = z.instances[z.last_id-1];
		var slide_distance = id - instance.$.cont.current_item;

		//alert(slide_distance);

		z.slide(instance,'forward',slide_distance);
	},
	getItem: function(instance,index) {
		var z = this, ItemInfo = {}, scaleAmount;
		switch(instance.opts.view) {		
			case '3d':					
				scaleAmount = 1+(index*instance.scale_amount);					
				ItemInfo.width  = instance.first_item_dimensions.w / scaleAmount;
				ItemInfo.height = instance.first_item_dimensions.h / scaleAmount;					
				ItemInfo.x = (instance.first_item_dimensions.w/2) + (ItemInfo.width * index);
				ItemInfo.y = instance.first_itemY;
			break;
		}	
		return ItemInfo;
	},
	slide: function(instance,direction,slide_distance) {
		var z = this,
		okToSlide,
		animateItem,
		animIndex,
		slideIndex,
		last_item,
		ItemInfo = {};

		/*if (instance.$.cont.current_item + slide_distance == instance.opts.max) {					
			instance.$.cont.find('.next').css('visibility','hidden');
		} else {
			instance.$.cont.find('.next').css('visibility','visible');
		}
		if (instance.$.cont.current_item - slide_distance < 0) {					
			instance.$.cont.find('.prev').css('visibility','hidden');
		} else {
			instance.$.cont.find('.prev').css('visibility','visible');
		}*/

		if (direction == 'backward') {
			slide_distance = -(slide_distance);
		}

		if (instance.opts.view == 'normal') {

			okToSlide = true;		

			var SlideMe = instance.$.cont.find('.cItems-content');
			var slideToItem = instance.$.cont.find('.cItem:eq('+(instance.$.cont.current_item + slide_distance)+')');

			var visibleAreaWidth = z.getElementRealDims(instance.$.cont.find('.cItems-content-outer')).w;
			visibleAreaWidth -= z.getElementRealDims(slideToItem).w;

			var maxSlide = parseInt(SlideMe.css('width')) - visibleAreaWidth;

			last_item = instance.$.cont.find('.cItem:eq('+(instance.$.cont.numberItems-2)+')');

			if (slideToItem.length > 0) {			
				var SlideToX = parseInt(slideToItem.css('left'),10);
				/*if (SlideToX < maxSlide) {
					okToSlide = true;
				}
				if (direction == 'forward') {
					if ((parseInt(last_item.css('left'),10)-parseInt(last_item.css('width'),10)) < visibleAreaWidth)	{
						okToSlide = false;
					}
				}*/		
			}
			else {
				okToSlide = false;
			}	

			//console.log('okToSlide:'+okToSlide);
		}
		else {
			okToSlide = true;
		}

		if (okToSlide) {
			switch(instance.opts.view) {		
				case '3d':					
					//console.log('CurrentItem:'+instance.$.cont.current_item);
					instance.$.cont.find('.cItem').each(function(index) {
						animateItem = instance.$.cont.find('.cItem:eq('+(index)+')');						
						animateItem.addClass("cItem2");
						animateItem.find('.cItemName').addClass("cItemName2");
						animateItem.find('.cItemRank').addClass("cItemRank2");
						animateItem.find('.cItemButton').addClass("cItemButton2");	
						animIndex = index + -(slide_distance);
						slideIndex = -(instance.$.cont.current_item) + index + -(slide_distance);						
						ItemInfo = z.getItem(instance,slideIndex);
						if ((slideIndex > -1)) {
							instance.isAnimating = true;												
							animateItem.animate({
						    	width: ItemInfo.width,
						    	height: ItemInfo.height,
						    	left: ItemInfo.x - (ItemInfo.width/2),
						    	top: ItemInfo.y - (ItemInfo.height/2)
						    },instance.opts.animSpeed,function() {	
						    	instance.isAnimating = false;						    	
						    });
						}	
						if (slideIndex < 0) {
							//animateItem.css('visibility','hidden');												
							animateItem.animate({						    	
						    	left: -(instance.first_item_dimensions.w+(instance.first_item_dimensions.w/2)),						    	
						    },instance.opts.animSpeed);
						}
						if (animIndex == instance.$.cont.current_item) {
							animateItem.removeClass("cItem2");
							animateItem.find('.cItemName').removeClass("cItemName2");
							animateItem.find('.cItemRank').removeClass("cItemRank2");
							animateItem.find('.cItemButton').removeClass("cItemButton2");
						}
					});
				break;
				case 'normal':
					SlideMe.animate({
				    	left: -(SlideToX)
				    },500);	
				break;
				default:
				break;
			}
			instance.$.cont.current_item+= slide_distance;	
		}	
	},
	getElementRealDims: function(elm,include_margin) {
		var z = this;
		var e,
			h = elm.height(),
			w = elm.width(),
			hc = ['padding-top','padding-bottom','border-top-width','border-bottom-width'],
			wc = ['padding-left','padding-right','border-left-width','border-right-width'],
			re = /[^0-9.]/g;
		if (include_margin) {
			hc = hc.concat(['margin-top','margin-bottom']);
			wc = wc.concat(['margin-left','margin-right']);
		}
		for (var i=0,c=hc.length;i<c;i++) {
			if (e = (elm.css(hc[i]) || '').replace(re,'')) h += +e;
		}
		for (var i=0,c=wc.length;i<c;i++) {
			if (e = (elm.css(wc[i]) || '').replace(re,'')) w += +e;
		}
		return {h:h,w:w};
	}
};