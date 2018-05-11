class ProductResultList {

    constructor(constructorObj){
        this.id = constructorObj.id;
        this.updateCallback = (constructorObj.update) ? constructorObj.update : function(){};
        this.removeCallback = (constructorObj.remove) ? constructorObj.remove : function(){};
        this.loadPageCallback = (constructorObj.onPageLoad) ? constructorObj.onPageLoad : function(){};
        this.updateButtonId = "productListUpdate"
        this.removeButtonId = "productListRemove"
        this.productListContainerId = "productListContainer"
        this.productListPageId = "productListPage"
        this.cellId = "cell"
        this.paginationElmId = '#'+this.id+'Pagination';
        this._init();
    }

    getCell(id){
        var sel = '#'+this.cellId +'_' +this.id +'_'+id;
        return $(sel);
    }

    setCellActive(id){
        var pageId = this.getCell(id).parents('ul').attr('id');
        var page = this._getId(pageId);
        this.paginator.twbsPagination('show', page)
    }

    _init(){
        var _partialUpdateSel = this.updateButtonId + "_" + this.id + "_";
        var _partialRemoveSel = this.removeButtonId + "_" + this.id + "_";
        var updateButtonSelector = this._getDynamicSelector('a', _partialUpdateSel);
        var removeButtonSelector = this._getDynamicSelector('button', _partialRemoveSel);
        var self = this;
        $(document.body).on('click', updateButtonSelector, function(e){
            var id = self._getId($(this).attr('id'))
            var sel = $(self._getDynamicSelector('a', _partialUpdateSel + id));
            self.updateCallback(sel, id, e);
        });

        $(document.body).on('click', removeButtonSelector, function(e){
            var id = self._getId($(this).attr('id'));
            var sel = $(self._getDynamicSelector('button', _partialRemoveSel + id));
            self.removeCallback(sel, id, e);
        })

        var paginationElm = $(this.paginationElmId);
        this.firstTimeLoaded = true;
        if (paginationElm.length){
            var paginationInfo = paginationElm.data('info');
            var totalPages = Math.ceil(paginationInfo.nTotal/paginationInfo.nPerPage);
            var pageElements = this._splitPages(paginationInfo.nPerPage, totalPages, paginationInfo.nTotal);
            if (totalPages > 0){
                this.paginator = paginationElm.twbsPagination({
                    totalPages: totalPages,
                    visiblePages: 7,
                    onPageClick: function (event, page) {
                        var selectedPageElm = null;
                        for(var i = 0; i < totalPages; i++){
                            var pageElm = $('#'+self.productListPageId+"_"+(Number.parseInt(i)+1));
                            if (i+1 == page){
                                pageElm.removeClass('page-inactive')
                                selectedPageElm = pageElm;
                            } else {
                                pageElm.addClass('page-inactive')
                            }
                        }

                        self._loadPage(page, paginationInfo.nPerPage, selectedPageElm);

                        var offset = $('#'+self.productListContainerId).offset().top - 2*$('.nav').height() - 25;
                        if (!self.firstTimeLoaded){
                            $('html, body').animate({
                                scrollTop: offset
                            }, 0);
                        }
                        self.firstTimeLoaded = false;
                    }
                });
            }
        }

    }

    _loadPage(page, nPerPage, selectedPageElm){
        if (selectedPageElm.children().length == 0){
            selectedPageElm.append($('<li><div class="col-md-6 col-md-offset-5"><div class="loader"></div></div></li>'));
            var self = this;
            var callback = function(response){
                var renderedProductList = $(response);
                selectedPageElm.children().remove();
                var rawCells = renderedProductList.find('#'+self.productListContainerId).find('li')
                for(var i = 0; i < rawCells.length; i++){
                    selectedPageElm.append($(rawCells[i]).clone());
                }
                renderedProductList.remove();
            }
            this.loadPageCallback(page, nPerPage, selectedPageElm, callback);
        }
    }

    _splitPages(nPerPage, nTotalPages, nTotal){
        var self = this;
        var PgID = function(id){ return self.productListPageId+'_'+id; }
        var PgIDSel = function(id){ return '#'+PgID(id); }
        var pageContainerElm = $('#'+this.productListContainerId);
        var pageElm0 = $(PgIDSel(0));
        if (pageElm0.length){
            var cellElms = pageElm0.children();
            pageElm0.empty();
            for (var i = 0; i < nTotalPages; i++){
                var pageElm_i = pageElm0.clone();
                pageElm_i.addClass('page-inactive');
                pageElm_i.attr('id', PgID(i+1))
                for (var j = 0; j < nPerPage; j++){
                    pageElm_i.append($(cellElms[i*nPerPage+j]).clone());
                }
                pageContainerElm.append(pageElm_i);
            }
        }
        pageElm0.remove();
    }

    _getId(selectorString){
        var ar = selectorString.split("_");
        return ar[ar.length-1];
    }

    _getDynamicSelector(sel, value){
        return sel+'[id^="'+value+'"]';
    }
}
