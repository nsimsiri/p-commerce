var React = require('react');
var sformat = require('util').format;

var uploadForm = React.createClass({
    getInitialState: function(){
        return {
            product: this.props.product,
            isUpdating: this.props.isUpdating
        }
    },

    getPhoto: function(){
        return sformat("/uploads/%s", this.state.product.photo);
    },

    getFormTitle: function(){
        if (this.state.isUpdating){
            return (<h3>Update your image.</h3>)
        }
        return (
            <h3>Step 2: Upload a featured photo. </h3>
        )
    },

	render: function(){
		return (
            <div className="row">
                <div className="form-group col-lg-4 col-lg-offset-4">
                    {this.getFormTitle()}
                </div>
                <img className="col-lg-4 col-lg-offset-4" id="photoTag" src={this.getPhoto()} alt="..." width="242" height="200" />
                <div id={sformat("param_%s", this.state.product._id)}> </div>
                <div className="form-group col-lg-4 col-lg-offset-4" id="">
                    <input className="form-control margin-top" id="productPictureFile" type="file" value={this.state.isUpdating ? this.state.product.photo : ""}/>
                    <button id="photoConfirmSubmit" className="btn btn-primary btn-block">
                        {this.state.isUpdating ? "Upload" : "Confirm Featured Photo"}
                    </button>
                </div>
			</div>
		)
	}
});

module.exports = uploadForm;
