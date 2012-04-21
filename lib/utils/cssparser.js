/*
---
name: CSSParser
description: Parses CSS
provides: [CSSParser]
...
*/
(function() {
    function trim(text) {
        var text = text.replace(/\s+/g, ' ').replace(/^\s\s*/, ''),
            ws = /\s/,
            i = text.length;

        while (ws.test(text.charAt(--i)));
        return text.slice(0, i + 1);
    }
    
    function CssBlock() {
        this.selectors = [];
        this.styles = [];
        this.comments = [];
    }
    CssBlock.prototype.toString = function() {
        return this.selectors.join(',')+'{'+this.styles.join('')+'}';
    };
    CssBlock.prototype.add_comment = function(comment, state) {
        this.comments.push(comment);
    };
    
    function CssSelector(selector) {
        this.selector = trim(selector);
    }
    CssSelector.prototype.toString = function() {
        return this.selector;
    };
    
    function CssProperty(name, value) {
        this.name = trim(name);
        this.value = trim(value);
    }
    CssProperty.prototype.toString = function() {
        return this.name+':'+this.value+';';
    };
    
    function CssComment(comment) {
        this.comment = comment;
    }
    CssComment.prototype.toString = function() {
        return this.comment;
    };
    
    var states = {
        NONE : 0,
        IN_COMMENT : 1,
        IN_BLOCK : 2,
        IN_SELECTOR : 3,
        IN_GROUP : 4,
        IN_PROPERTY : 5,
        IN_VALUE : 6,
        IN_STRING : 7
    };
    
    function parse(css) {
        var state = states.NONE,
            prev_state,
            quote_chr,
            comment,
            selector,
            property,
            value,
            block;
        
        var blocks = [];
        for(var i = 0, len = css.length; i < len; i++) {
            var chr = css[i];
            var process = true;

            if(state !== states.IN_STRING && state !== states.IN_COMMENT && chr === '/' && css[i+1] === '*') {
                prev_state = state;
                state = states.IN_COMMENT;
                
                comment = '';
            }
            else if(state === states.IN_COMMENT && chr === '*' && css[i+1] === '/' && comment.length > 1) {
                state = prev_state;
                process = false;
                
                //TODO
                //comment = new CssComment(comment+'*/');
                //if(state === states.NONE) {
                // blocks.push(comment);
                //}
                //else {
                // block.add_comment(comment, state);
                //}
                
                ++i;
            }
            else if(state === states.IN_STRING && chr === quote_chr) {
                state = states.IN_VALUE;
            }
            else if(state === states.IN_VALUE && (/['"]/).test(chr)) {
                state = states.IN_STRING;
                quote_chr = chr;
            }
            else if(state === states.IN_VALUE && chr === ';') {
                state = states.IN_GROUP;
                
                block.styles.push(new CssProperty(property, value));
            }
            else if(state === states.IN_VALUE && chr === '}') {
                state = states.NONE;
                
                block.styles.push(new CssProperty(property, value));
            }
            else if(state === states.IN_PROPERTY && chr === ':') {
                state = states.IN_VALUE;
                
                process = false;
                value = '';
            }
            else if(state === states.IN_GROUP && (/[a-z0-9_\-]/i).test(chr)) {
                state = states.IN_PROPERTY;
                
                property = '';
            }
            else if(state === states.IN_GROUP && chr === '}') {
                state = states.NONE;
            }
            else if(state === states.IN_SELECTOR && chr === ',') {
                state = states.IN_BLOCK;
                
                block.selectors.push(new CssSelector(selector));
            }
            else if(state === states.IN_SELECTOR && chr === '{') {
                state = states.IN_GROUP;
                
                block.selectors.push(new CssSelector(selector));
            }
            else if(state === states.IN_BLOCK && (/[a-z0-9#.:_\-]/i).test(chr)) {
                state = states.IN_SELECTOR;
                
                selector = '';
            }
            else if(state === states.NONE && (/[a-z0-9#.:_\-]/i).test(chr)) {
                state = states.IN_SELECTOR;
                
                blocks.push(block = new CssBlock());
                selector = '';
            }
            
            if(process) {
                switch(state) {
                    case states.IN_SELECTOR:
                        selector += chr;
                        break;
                    case states.IN_PROPERTY:
                        property += chr;
                        break;
                    case states.IN_VALUE:
                    case states.IN_STRING:
                        value += chr;
                        break;
                    case states.IN_COMMENT:
                        comment += chr;
                        break;
                }
            }
        }

        return blocks;
    }
    
    this.CSSParser = {
        CssBlock : CssBlock,
        CssSelector : CssSelector,
        CssProperty : CssProperty,
        parse : parse
    };
    module.exports = this.CSSParser;
})();
