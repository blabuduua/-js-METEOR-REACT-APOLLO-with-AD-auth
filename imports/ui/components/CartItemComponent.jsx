import React, { Component } from 'react';
import Button from '@material-ui/core/Button';
import PropTypes from 'prop-types'

export default class CartItem extends Component {
    render() {
        const { price, title, onRemoveItem } = this.props;

        return (
            <div>
                <span> {title} </span>
                <span> Price: {price} </span>
                <Button
                    variant="outlined"
                    color="secondary"
                    onClick={onRemoveItem}
                >
                    Х
                </Button>
            </div>
        )
    }
}

CartItem.propTypes = {
    price: PropTypes.number,
    title: PropTypes.string,
    onRemoveItem: PropTypes.func.isRequired
};
