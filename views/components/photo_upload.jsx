var React = require('react');
var sformat = require('util').format;
var DefaultLayout = require('../layout/master');
/*
    JQuery ID list (script is js/sell_page.js)
    #photoUploadList : ul element for maintaining file object
    #photoUploadListIdx_<n> : li of the nth file element
    #photoUploadRemove_<n> : remove button of the nth file element
    #photoUploadFeaturedImage : img of featured image, the first elm of file list.
    #photoUploadAddPhoto : input type='file' for file input

    <ul className="list-group scrollable-photo-upload" id="photoUploadList">
    </ul>

    <div className="col-md-1 rounded" style={this.state._img_wrap_stype}>
        <img src="/uploads/1q84.jpg" style={this.state._img_style}/>
        <button type="button" className="close li-photo-upload-x">&times;</button>
    </div>
*/

var PhotoUploadComponent = React.createClass({
    getInitialState: function(){
        return {
            _img_style: {
                'max-width': "70px",
                'max-height': "70px",
                'padding-top': '5px',
                'padding-bottom': '5px',
                'margin-left': '-10px'
            },
            _img_wrap_stype: {
                "border": "1px solid #D3D3D3",
                "border-radius": "10px",
                'margin-right': '5px',
                'margin-bottom': '5px'
            }
        };
    },

    /*
    example list li
    <li className="list-group-item" id="photoUploadListIdx_0">
        First item
        <button type="button" className="close" id="photoUploadRemove_0">&times;</button>
    </li>

    <button id="photoUploadSubmit" className="btn btn-default btn-block">
        upload
    </button>

    <div className="row">
        <div className="col-md-4 col-md-offset-2">
            <h4>
                Featured Image
            </h4>
        </div>
        <div className="col-md-4">

        </div>
    </div>
    */
    getImageGrid: function(){
        return (
            <div className="container">
            <div className="row">
                <div className="form-group col-lg-8 col-md-offset-2">
                    <h3> <span data-i18n="sell-step-1">อันดับ 1: อัพโหลดรูป</span></h3>
                    <hr size='30'/>
                </div>
            </div>

                <div className="row">
                    <div className="col-md-4 col-md-offset-2">
                        <div className="row">
                        <h4>
                            <span data-i18n="featured-product">รุปโชว์สินค้่า</span>
                        </h4>
                        </div>
                        <div className="row">
                            <div className="thumbnail">
                                <a href="#" target="_blank">
                                    <img src="/uploads/default.jpg" id="photoUploadFeaturedImage" width="242" height="200" style={this._img_style}/>
                                </a>
                            </div>
                            <input className="form-control margin-top" id="photoUploadAddPhoto" type="file"/>
                            <div className="hidden" id="maxPhotoMsg" data-i18n="max-photos">อัพโหลดได้มากที่สุด 9 รูป</div>
                        </div>

                    </div>
                    <div className="col-md-3" style={{'margin-left':'10px'}}>
                        <div className="row">
                            <h4>
                                <span data-i18n="selected-image">รุปที่อัพโหลด</span>
                            </h4>
                        </div>
                        <div className="row">
                            <div className="container" id="photoUploadList">
                                <div className="row" id="photoUploadRow_0"></div>
                                <div className="row" id="photoUploadRow_1"></div>
                                <div className="row" id="photoUploadRow_2"></div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        )
    },

    render: function(){
        return (
            <div>
            {this.getImageGrid()}
            </div>
        )
    }
});

module.exports = PhotoUploadComponent;
