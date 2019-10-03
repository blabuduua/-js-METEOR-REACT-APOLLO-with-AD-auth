import React, { Component } from 'react';
import PropTypes from 'prop-types'

export default class Inventory extends Component {
    constructor(props) {
        super(props);
        this.changeHandler = this.changeHandler.bind(this);
    }

    changeHandler(event) {
        this.props.onChangeQuantity(event);
    }

    render() {
        const { inventory, quantity, _id } = this.props;

        let options = [];

        for(let i = 1; i < inventory + 1; i++){
            options.push(<option key={`inventory_${i}_${_id}`} value={i}> {i} </option> );
        }

        return (
            <div>
                <span>Quantity</span>
                <select required onChange={this.changeHandler} value={quantity}>
                    {options}
                </select>
            </div>
        )
    }
}

Inventory.propTypes = {
    _id: PropTypes.string,
    inventory: PropTypes.number,
    quantity: PropTypes.number,
    onChangeQuantity: PropTypes.func.isRequired
};
