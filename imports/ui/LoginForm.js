import React from 'react'

import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Link from '@material-ui/core/Link';
import Paper from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';

import { useMutation } from '@apollo/react-hooks'
import { gql } from "apollo-boost"

const authenticate = gql`
    mutation authenticate($login: String!, $password: String!){
        authenticate(login: $login, password: $password)
    }
`;

function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {'Copyright © '}
      <Link color="inherit" href="https://material-ui.com/">
        Help & Care
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

const useStyles = makeStyles(theme => ({
  root: {
    height: '100vh',
  },
  image: {
    backgroundImage: 'url(https://source.unsplash.com/random)',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  },
  paper: {
    margin: theme.spacing(8, 4),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

export default LoginForm = (props) => {
    let login;
    let password;
    const classes = useStyles();

    const [authenticateFunction] = useMutation(authenticate);

    handleLoginUser = e => {
        e.preventDefault();

        authenticateFunction({
           variables: {
               login: login.value + "@flyuia.com",
               password: password.value
            }
        })
            .then(({ data }) => {

            if(data.authenticate !== '1' && data.authenticate !== '11' && data.authenticate !== '111' && data.authenticate !== '1111' && data.authenticate !== '11111'){
                const obj = JSON.parse(data.authenticate);

                if(obj.access === 3 || obj.access === 4){
                    Accounts.createUser(
                        {
                            username: obj.login,
                            password: obj.password,
                            email: obj.login,
                            profile: {
                                employeeID: obj.employeeID,
                                displayName: obj.displayName,
                                email: obj.mail,
                                admin: 1,
                                user: 1
                            }
                        },
                        error => {
                            if(!error){
                                props.client.resetStore();
                            }else{
                                console.log('cb register ' + error);

                                Meteor.loginWithPassword(obj.login, obj.password,
                                    error => {
                                        if(!error){
                                            const userId = Meteor.userId();

                                            // ОБНОВЛЯЕМ ИНФУ ЮЗЕРА
                                            Meteor.users.update({ _id: userId }, {
                                                $set:{
                                                    'profile': {
                                                        employeeID: obj.employeeID,
                                                        displayName: obj.displayName,
                                                        email: obj.mail,
                                                        admin: 1,
                                                        user: 1
                                                    }
                                                }
                                            });

                                            props.client.resetStore();
                                        }else{
                                            // ОБНОВИТЬ ПАРОЛЬ И ПОВТОРИТЬ ПОПЫТКУ ВХОДА

                                        }
                                        console.log('cb login ' +error)
                                    });
                            }
                        });
                }
                else if (obj.access === 5){
                    Accounts.createUser(
                        {
                            username: obj.login,
                            password: obj.password,
                            email: obj.login,
                            profile: {
                                employeeID: obj.employeeID,
                                displayName: obj.displayName,
                                email: obj.mail,
                                admin: 0,
                                user: 1
                            }
                        },
                        error => {
                            if(!error){
                                props.client.resetStore();
                            }else{
                                console.log('cb register ' + error);

                                // НАЗНАЧАЕМ ДОСТУПЫ МЕТЕОР
                                Meteor.loginWithPassword(obj.login, obj.password,
                                    error => {
                                        if(!error){
                                            const userId = Meteor.userId();

                                            // ОБНОВЛЯЕМ ИНФУ ЮЗЕРА
                                            Meteor.users.update({ _id: userId }, {
                                                $set:{
                                                    'profile': {
                                                        employeeID: obj.employeeID,
                                                        displayName: obj.displayName,
                                                        email: obj.mail,
                                                        admin: 0,
                                                        user: 1
                                                    }
                                                }
                                            });

                                            props.client.resetStore();
                                        }else{
                                            // ОБНОВИТЬ ПАРОЛЬ И ПОВТОРИТЬ ПОПЫТКУ ВХОДА

                                        }
                                        console.log('cb login ' +error)
                                    });
                            }
                        });
                }
            }else{
                // ПОКАЗАТЬ СООТВЕТСВУЮЩУЮ ОШИБКУ
                console.log(data.authenticate);
            }
        })
            .catch(error => {
            console.log(error);
            // Unauthorized error.message for form validation and API control
        });
    };

    return (
      <Grid container component="main" className={classes.root}>
        <CssBaseline />
        <Grid item xs={false} sm={4} md={7} className={classes.image} />
        <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
          <div className={classes.paper}>
            <Avatar className={classes.avatar}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              Sign in
            </Typography>
            <form onSubmit={ handleLoginUser } className={classes.form} noValidate autoComplete="off">
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                inputRef={ (input) => login = input }
              />
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                inputRef={ (input) => password = input }
              />
              <FormControlLabel
                control={<Checkbox value="remember" color="primary" />}
                label="Remember me"
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                className={classes.submit}
              >
                Sign In
              </Button>
              <Grid container>
                <Grid item>
                  <Link href="#" variant="body2">
                    {"Don't have an account? Sign Up"}
                  </Link>
                </Grid>
              </Grid>
              <Box mt={5}>
                <Copyright />
              </Box>
            </form>
          </div>
        </Grid>
      </Grid>
    )
}
