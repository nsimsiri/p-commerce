var React = require('react');
var sformat = require('util').format
var config = require('../../config');
var href=function(x){return sformat("%s/%s", config.ROOT_URL, x);}


var ProductGalleryComponent = React.createClass({
    getInitialState: function(){
        return {
            product: this.props.product
        }
    },
    createSlide: function(url){
        return (
            <a href={url}>
                <img src={url} data-big={url}/>
            </a>
        )
    },
    renderSlides: function(){
        var self =this;
        if (self.state.product){
            var photos = self.state.product.photos;
            if (photos && photos.length >0){
                return photos.map(function(url){
                    return self.createSlide(sformat("/uploads/%s", url));
                })
            }
        }
        return this.createSlide(config.DEFAULT_PRODUCT_IMGURL);
    },
    render: function(){
        return (
            <div>
                <link rel="stylesheet" href={href("css/galleria.classic.min.css")} type="text/css" />
                <script type="text/javascript" src={href("js/galleria-1.5.5.min.js")}/>
                <script type="text/javascript" src={href("js/galleria.classic.min.js")}/>
                <div className="content">
                    <div id="galleria">
                        {this.renderSlides()}
                    </div>
                </div>
    		</div>
        )
    }
});

module.exports = ProductGalleryComponent;

/*
<link rel="stylesheet" href={href("css/galleriffic-2.css")} type="text/css" />
<script type="text/javascript" src={href("js/jquery.galleriffic.js")}/>
<script type="text/javascript" src={href("js/jquery.opacityrollover.js")}/>
    <div id="gallery" className="content">
        <div className="slideshow-container">
            <div id="loading" className="loader"></div>
            <div id="slideshow" className="slideshow"></div>
        </div>
    </div>
    <div id="thumbs" className="navigation">
        <ul className="thumbs noscript">
            <li>
                <a className="thumb" name="leaf" href="http://farm4.static.flickr.com/3261/2538183196_8baf9a8015.jpg" title="Title #0">
                    <img src="http://farm4.static.flickr.com/3261/2538183196_8baf9a8015_s.jpg" alt="Title #0" />
                </a>
                <div className="caption">
                    <div className="download">
                        <a href="http://farm4.static.flickr.com/3261/2538183196_8baf9a8015_b.jpg">Download Original</a>
                    </div>
                    <div className="image-title">Title #0</div>
                    <div className="image-desc">Description</div>
                </div>
            </li>
            <li>
                <a className="thumb" name="leaf" href="http://farm4.static.flickr.com/3261/2538183196_8baf9a8015.jpg" title="Title #0">
                    <img src="http://farm4.static.flickr.com/3261/2538183196_8baf9a8015_s.jpg" alt="Title #0" />
                </a>
                <div className="caption">
                    <div className="download">
                        <a href="http://farm4.static.flickr.com/3261/2538183196_8baf9a8015_b.jpg">Download Original</a>
                    </div>
                    <div className="image-title">Title #0</div>
                    <div className="image-desc">Description</div>
                </div>
            </li>
            <li>
                <a className="thumb" name="leaf" href="http://farm4.static.flickr.com/3261/2538183196_8baf9a8015.jpg" title="Title #0">
                    <img src="http://farm4.static.flickr.com/3261/2538183196_8baf9a8015_s.jpg" alt="Title #0" />
                </a>
                <div className="caption">
                    <div className="download">
                        <a href="http://farm4.static.flickr.com/3261/2538183196_8baf9a8015_b.jpg">Download Original</a>
                    </div>
                    <div className="image-title">Title #0</div>
                    <div className="image-desc">Description</div>
                </div>
            </li>
        </ul>
</div>
*/
