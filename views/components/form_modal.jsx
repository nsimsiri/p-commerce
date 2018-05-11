var React = require('react');
var sformat = require('util').format;

var FormModalComponent = React.createClass({
    getInitialState: function(){
        return {
            name: this.props.name ? this.props.name : "Modal",
            id: this.props.id,
            actionName: this.props.actionName ? this.props.actionName : "Confirm",
            actionId: this.props.actionId

        }
    },
    render: function(){
        return (
            <div>
            <div className="modal fade" id={this.state.id} role="dialog">
                <div className="modal-dialog">
                  <div className="modal-content">
                    <div className="modal-header">
                      <button type="button btn-default" className="close" data-dismiss="modal">&times;</button>
                      <h4 className="modal-title">{this.state.name}</h4>
                    </div>
                    <div className="modal-body">
                        {this.props.children}
                    </div>
                    <div className="modal-footer">
                        <button id={this.state.actionId} type="button" className="btn btn-default" data-dismiss="modal">
                            <span data-i18n={this.state.actionName}>{this.state.actionName}</span>
                        </button>
                        <button type="button" className="btn btn-default" data-dismiss="modal" data-i18n="close-word">Close</button>
                    </div>
                  </div>
                </div>
            </div>
            </div>
        )
    }
})

module.exports = FormModalComponent;
