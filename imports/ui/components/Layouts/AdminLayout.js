import React, { Fragment } from 'react';
import { Link, withRouter } from 'react-router-dom'
import PropTypes from 'prop-types';
import AppBar from '@material-ui/core/AppBar';
import CssBaseline from '@material-ui/core/CssBaseline';
import Drawer from '@material-ui/core/Drawer';
import Hidden from '@material-ui/core/Hidden';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import {AddShoppingCartOutlined, ExpandLess, ExpandMore, LibraryBooksOutlined, LibraryMusicOutlined, ShoppingCartOutlined} from "@material-ui/icons";
import Collapse from "@material-ui/core/Collapse";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import { compose } from "recompose";

const drawerWidth = 240;

const useStyles = makeStyles(theme => ({
    root: {
        display: 'flex',
    },
    drawer: {
        [theme.breakpoints.up('sm')]: {
            width: drawerWidth,
            flexShrink: 0,
        },
    },
    appBar: {
        zIndex: theme.zIndex.drawer + 1,
    },
    menuButton: {
        marginRight: theme.spacing(2),
        [theme.breakpoints.up('sm')]: {
            display: 'none',
        },
    },
    toolbar: theme.mixins.toolbar,
    drawerPaper: {
        width: drawerWidth,
    },
    content: {
        flexGrow: 1,
        padding: theme.spacing(3),
    },
    nested: {
        paddingLeft: theme.spacing(4),
    },
    nav: {
        width: '100%',
        maxWidth: 360,
        backgroundColor: theme.palette.background.paper,
    },
}));

function ResponsiveDrawer(props) {
    const { container, children, location: {pathname} } = props;
    const classes = useStyles();
    const theme = useTheme();
    const [mobileOpen, setMobileOpen] = React.useState(false);
    const [open, setOpen] = React.useState(true);

    function handleDrawerToggle() {
        setMobileOpen(!mobileOpen);
    }

    function handleClick() {
        setOpen(!open);
    }

    const drawer = (
        <div>
            <Hidden xsDown implementation="css">
                <div className={classes.toolbar} />
            </Hidden>
            <List
                component="nav"
                className={classes.nav}
            >
                <ListItem button component={Link} to="/cart" selected={'/cart' === pathname}>
                    <ListItemIcon>
                        <ShoppingCartOutlined />
                    </ListItemIcon>
                    <ListItemText primary="Cart" />
                </ListItem>
                <ListItem button onClick={handleClick}>
                    <ListItemIcon>
                        <AddShoppingCartOutlined />
                    </ListItemIcon>
                    <ListItemText primary="Products" />
                    {open ? <ExpandLess /> : <ExpandMore />}
                </ListItem>
                <Collapse in={open} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                        <ListItem button component={Link} to="/books" selected={'/books' === pathname} className={classes.nested}>
                            <ListItemIcon>
                                <LibraryBooksOutlined />
                            </ListItemIcon>
                            <ListItemText primary="Books" />
                        </ListItem>
                        <ListItem button component={Link} to="/music" selected={'/music' === pathname} className={classes.nested}>
                            <ListItemIcon>
                                <LibraryMusicOutlined />
                            </ListItemIcon>
                            <ListItemText primary="Music" />
                        </ListItem>
                    </List>
                </Collapse>
            </List>
        </div>
    );

    return (
        <Fragment>
            <div className={classes.root}>
                <CssBaseline />
                <AppBar position="fixed" color="primary" className={classes.appBar}>
                    <Toolbar>
                        <IconButton
                            color="inherit"
                            aria-label="Open drawer"
                            edge="start"
                            onClick={handleDrawerToggle}
                            className={classes.menuButton}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Typography variant="h6" noWrap>
                            Help & Care
                        </Typography>
                    </Toolbar>
                </AppBar>
                <nav className={classes.drawer} aria-label="Mailbox folders">
                    {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
                    <Hidden smUp implementation="css">
                        <Drawer
                            container={container}
                            variant="temporary"
                            anchor={theme.direction === 'rtl' ? 'right' : 'left'}
                            open={mobileOpen}
                            onClose={handleDrawerToggle}
                            classes={{
                                paper: classes.drawerPaper,
                            }}
                            ModalProps={{
                                keepMounted: true, // Better open performance on mobile.
                            }}
                        >
                            {drawer}
                        </Drawer>
                    </Hidden>
                    <Hidden xsDown implementation="css">
                        <Drawer
                            classes={{
                                paper: classes.drawerPaper,
                            }}
                            variant="permanent"
                            open
                        >
                            {drawer}
                        </Drawer>
                    </Hidden>
                </nav>
                <main className={classes.content}>
                    <div className={classes.toolbar} />
                    {children}
                </main>
            </div>
        </Fragment>
    );
}

ResponsiveDrawer.propTypes = {
    container: PropTypes.object,
};

export default compose(
    withRouter,
)(ResponsiveDrawer);