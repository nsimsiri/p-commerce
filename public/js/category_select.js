class CategorySelector {
    constructor(constructorObj){
        this.id = constructorObj.id;
        this.moveModalToId = constructorObj.moveModalToId;
        this.reloadOnOpen = constructorObj.reloadOnOpen;
        this.includeRootOption = constructorObj.includeRootOption;

        this.backButtonId = this.id+"_back";
        this.containerId = this.id+"_container"
        this.confirmButtonId = this.id+"_confirm";
        this.inputBoxId = this.id+"_input";
        this.navId = this.id+"_nav";
        this.selectedCategoryId = this.id+"_selectedCategory"
        this.selectedCategory = $('#'+this.selectedCategoryId).data('category');
        this.navState = ['root'];
        this.categories = [];
        if (this.selectedCategory!=null){
            this.setCategory(this.selectedCategory);
        }
        if (this.moveModalToId!=null){
            var modalElm = $('#'+this.id);
            var copiedHtml = modalElm.prop('outerHTML');
            $(this.moveModalToId).append(copiedHtml);
            modalElm.remove();
        }

        this._init();

    }

    setCategory(category){
        if (category){
            var hasCategory = this.categories.some(function(x){ return x._id == category._id });
            if (!hasCategory){
                this.categories.push(category);
            }
            $('#'+this.inputBoxId).val(category.name);
        } else {
            $('#'+this.inputBoxId).val('');
        }
    }

    getCategory(){
        var categoryName = $('#'+this.inputBoxId).val();
        if (categoryName && categoryName.length > 0){
            return this.categories.find(function(x){ return x.name == categoryName})
        }
        return null;
    }

    getLoadedCategories(){
        return this.categories;
    }

    _init(){
        var self = this;
        var onLoad =  function(category, categories){
            if (categories && categories.length > 0){
                categories.forEach(function(newCategory){
                    var hasCategory = self.categories.some(function(cat){ return cat._id == newCategory._id });
                    if (!hasCategory){
                        self.categories.push(newCategory);
                    }
                });
                if (category != null){
                    self.navState.push(category.name);
                    categories.unshift(category); // render other parent category..
                }

                var newPageId = self.pageID(self.navStateString());
                if (!self.hasPage(newPageId)){
                    self._createPage(categories);
                }
                self.turnPage();
            } else {
                self._selectCategoryAndCloseModal(category);
            }
        }

        $(document.body).on('click', '#'+this.id+'_open', function(e){
            e.preventDefault();
            $('#'+self.id).modal('show');
        })

        $(document.body).on('click', 'button[id^="'+self.cellID('')+'"]', function(e){
            e.preventDefault();
            var id = self._getId($(this).attr('id'));
            var category = self.categories.find(function(x){ return id == x._id});
            console.log("??");
            console.log(category);
            console.log(id);
            var isParent = $(this).hasClass('parent');
            if (isParent || id == -1){
                console.log('closing');
                self._selectCategoryAndCloseModal(category);
            } else {
                self._loadAndRenderSubtree(category, onLoad)
            }
        })

        $(document.body).on('click', '#'+this.backButtonId , function(e){
            e.preventDefault();
            self.navState.pop();
            self.turnPage();
        })

        // on modal click
        $('#'+this.id).on('show.bs.modal', function(e){
            // reset state to root
            var containerElm = $('#'+self.containerId)
            if ((self.reloadOnOpen && !containerElm.is(':empty')) || containerElm.is(':empty')){
                $('#'+self.containerId).empty();
                self._loadAndRenderSubtree(null, onLoad) //load root of category tree
            }
            console.log("hi");
            self.navState = ['root']
            self.turnPage();
        })
    }

    _loadAndRenderSubtree(parent, callback){
        var _parent = (parent && parent._id) ? parent : {'_id': ''};
        var self = this;
        var url = window.location.origin + "/category/children?categoryId="+_parent._id
        var settings = {
          "async": true,
          "crossDomain": true,
          "url": url,
          "method": "GET",
        }
        console.log(settings);
        $.ajax(settings).done(function(response){
            console.log("---");
            console.log(response);
            callback(parent, response);
        })
    }

    _createPage(categories){
        var self = this;
        var path = this.navStateString();
        var isRoot = this.navState.length == 1;
        var pageElm = $("<div id='"+ this.pageID(path) + "'></div>");
        if (self.includeRootOption && isRoot){
            pageElm.append(self._createCell(null, false));
        }
        categories.forEach(function(category, i){
            var isParent = (!isRoot && i==0);
            pageElm.append(self._createCell(category, isParent).prop('outerHTML'));
        });
        pageElm.addClass('page-inactive');

        $('#'+this.containerId).append(pageElm);
        return pageElm;
    }

    _createCell(category, isParent){
        if (category == null){
            category = {'_id': -1, name: 'Root'}
        }
        var name = (!isParent) ? category.name : 'Other ' + category.name;
        var parent = (isParent) ? 'parent' : ''
        var cellElm = $(
            "<div class='row margin-top'>" +
                "<button class='btn btn-default col-md-6 col-md-offset-3 col-xs-offset-4"+ parent+"' id='"+ this.cellID(category._id) + "'>"
                + name + "</button>" +
            "</div>"
        );
        return cellElm
    }

    turnPage(){
        var self=  this;
        var path = this.navStateString();
        var backButtonElm = $('#'+this.backButtonId);
        if (this.navState.length<=1){
            backButtonElm.attr('disabled','');
        } else {
            backButtonElm.removeAttr('disabled')
        }
        var pageId = this.pageID(path);
        $('#'+this.navId).text(this.navState.join(' / '));
        var genericId = 'div[id^="'+this.pageID('')+'"]';
        var pageElms = $(genericId);
        if (pageElms.length > 0){
            for(var i = 0; i < pageElms.length; i++){
                var pageElm = $(pageElms[i]);
                pageElm.addClass('page-inactive');
                if (pageElm.attr('id') == pageId){
                    pageElm.removeClass('page-inactive');
                }
            }
        }
    }

    hasPage(pageId){
        return $('#'+pageId).length > 0;
    }

    cellID(id){
        return this.id + "_cell_" +id;
    }

    pageID(path){
        return this.id+"_page_" + path;
    }

    navStateString(){
        return this.navState.map(function(x){ return x.trim().replace(' ','-'); }).join('_')
    }

    _getId(str){
        var arr = str.split("_");
        return arr[arr.length-1];
    }

    _getModal(){
        return $('#'+ this.id);
    }

    _selectCategoryAndCloseModal(category){
        if (category){
            this.setCategory(category);
        } else {
            this.setCategory(null);
        }
        this._getModal().modal('hide');
    }

}
// Test
// $(document).ready(function(){
//     var catSel = new CategorySelector({
//         id: 'test'
//     })
//
//     $(document.body).on('click', '#getCategory', function(e){
//         e.preventDefault();
//         alert(JSON.stringify(catSel.getCategory()));
//         console.log(catSel.getLoadedCategories());
//     })
//
// });
