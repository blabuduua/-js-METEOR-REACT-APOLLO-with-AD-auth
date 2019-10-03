import React, { Component } from 'react';
import Button from '@material-ui/core/Button';
import PropTypes from 'prop-types'

export default class Product extends Component {
    render() {
        const { price, inventory, title, onAddToCart } = this.props;

        return (
            <div className="product">
                <span> {title} - ${price} {inventory ? `Current inventory ${inventory}` : null} </span>
                <Button
                    variant="outlined"
                    color="primary"
                    onClick={onAddToCart}
                >
                    Добавить в корзину
                </Button>
            </div>
        )
    }
}

Product.propTypes = {
    price: PropTypes.number,
    inventory: PropTypes.number,
    title: PropTypes.string,
    onAddToCart: PropTypes.func.isRequired
};
