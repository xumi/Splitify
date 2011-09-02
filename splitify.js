(function() {
	var $, Splitify;
	$ = jQuery;
	
	$.fn.extend({
		splitify: function(options) {
			return $(this).each(function(input) {
				return new Splitify(this, options);
			});
		}
	});
	Splitify = (function() {
    	function Splitify(source,options) {
    		this.source = $(source);
    		this.options = options;
			this.mergeOptions();
			this.initializeDom();
			this.initializeEvents();
		}
		
		Splitify.prototype.mergeOptions = function() {
			var defaults = {
				input: {text:'',classes:''},
				label: {text:'Item',classes:''},
				row: {type:'div',classes:''},
				button: {text:'Add a row',classes:''},
				validation: {regexp:false,callback:function(){}},
				separator: ','
			};
			this.options = $.extend(defaults, this.options);
		};
		
		Splitify.prototype.initializeDom = function() {
			this.namespace = 'splitify_container_'+$('.splitify_container').length;
			this.source.after('<div id="'+this.namespace+'" class="splitify_container"></div>');
			this.context = $('#'+this.namespace);
			this.initial_value = this.source.val();
			this.source.hide();
			var html = '';
			var _this = this;
			$(this.initial_value.split(this.options.separator)).each(function(index){
				html += _this.createLineHTML(index,this);
			});
			if(typeof this.options.button == "object")
				html += '<input type="button" value="'+this.options.button.text+'" class="'+this.options.button.classes+' splitify_add" />';
			this.context.html(html);
		};
		
		Splitify.prototype.createLineHTML = function(index,value) {
			var html = '<'+this.options.row.type+' class="'+this.options.row.classes+'">';
			if(typeof this.options.label == "object")
				html += '<label for="'+this.namespace+'_'+index+'" class="'+this.options.label.classes+'">'+this.options.label.text+'</label>';
			html += '<input id="'+this.namespace+'_'+index+'" type="text" value="'+value+'" class="'+this.options.input.classes+' splitified" />';
			html += '</'+this.options.row.type+'>';
			return html;
		};
		
		Splitify.prototype.initializeEvents = function() {
			var _this = this;
			this.context.find('.splitified:last').live('keydown',function(e){
				return _this.addRowAfter($(this),e);
			});
			this.context.find('.splitify_add').click(function(){
				_this.addRow();
			});
			this.context.parents('form').bind('submit',function(){
				return _this.replaceData();
			});			
		};
		
		
		Splitify.prototype.addRowAfter = function(input,e) {
			if(e.which!='9') return true; // press Tab
			if(e.shiftKey) return true; // try to go to previous input, don't change this behavior
			if($.trim(input.val())==this.options.input.text){ e.preventDefault(); return false; } // don't create another one if still empty
			this.addRow(this.context.find('.splitified').index(input)+1);
			return false;
		};
		
		Splitify.prototype.addRow = function(index) {
			this.context.find('.splitified:last').after(this.createLineHTML(index,this.options.input.text));
			this.context.find('.splitified:last').focus().select();
		};

		Splitify.prototype.replaceData = function(index) {
			var _this = this;
			var content = [];
			var must_validate = typeof _this.options.validation == "object" && typeof _this.options.validation.callback == "function"
			var is_valid = true;
			this.context.find('.splitified').each(function(){
				var val =  $(this).val();
				if(must_validate){ // check with given Regexp
					if(!_this.options.validation.regexp.test(val)){
						is_valid = false;
						_this.options.validation.callback(this);
						return true; // continue
					}
				}
				if(is_valid) content.push(val);
			});
			if(is_valid) this.source.val(content.join(this.options.separator));
			return is_valid;
		};

		return Splitify;
	})();
}).call(this);