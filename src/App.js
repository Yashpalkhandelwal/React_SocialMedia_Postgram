import React, {useEffect, useState} from "react";
import "./App.css";
import Post from "./Post";
import {db, auth} from "./firebase";
import {makeStyles} from "@material-ui/core/styles";
import Modal from "@material-ui/core/Modal";
import {Button, Input} from "@material-ui/core";
import ImageUpload from "./ImageUpload";
import Avatar from "@material-ui/core/avatar";
import TextField from '@material-ui/core/TextField';

function getModalStyle() {
    const top = 50;
    const left = 50;

    return {top: `${top}%`, left: `${left}%`, transform: `translate(-${top}%, -${left}%)`};
}

const useStyles = makeStyles((theme) => ({
    paper: {
        position: "absolute",
        width: 400,
        backgroundColor: theme.palette.background.paper,
        border: "2px solid #eee",
        boxShadow: theme.shadows[5],
        padding: theme.spacing(2, 4, 3)
    }
}));

function App() {
    const classes = useStyles();
    const [modalStyle] = useState(getModalStyle);
    const [posts, setPosts] = useState([]);
    const [open, setOpen] = useState(false);
    const [openSignIn, setOpenSignIn] = useState(false);
    const [openaddpost, setOpenAddPost] = useState(false);
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [user, setUser] = useState(null);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((authUser) => {
            if (authUser) {
                //user has logged in....
                setUser(authUser);
            } else {
                //user has logged out
                setUser(null);
            }
        });
        return() => {
            unsubscribe();
        };
    }, [user, username]);

    useEffect(() => {
        db
            .collection("posts")
            .orderBy("timestamp", "desc")
            .onSnapshot((snapshot) => {
                setPosts(snapshot.docs.map((doc) => ({id: doc.id, post: doc.data()})));
            });
    }, []);

    const signUp = (event) => {
        event.preventDefault();
        auth
            .createUserWithEmailAndPassword(email, password)
            .then((authUser) => {
                let userInfo = authUser
                    .user
                    .updateProfile({displayName: username});
                setUser({displayName: username});
                return userInfo;
            })
            .catch((error) => alert(error.message));
        setOpen(false);
    };

    const signIn = (event) => {
        event.preventDefault();
        auth
            .signInWithEmailAndPassword(email, password)
            .catch((error) => alert(error.message));

        setOpenSignIn(false);
    };

    return (
        <div className="app">
            <Modal open={open} onClose={() => setOpen(false)}>
                <div style={modalStyle} className={classes.paper}>
                    <form className="app__signup">
                        <center>
                            <h1 className="app_logo">
                                Vartalapp
                            </h1>
                        </center>
                        <Input
                            type="text"
                            placeholder="UserName"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}/>
                        <Input
                            type="text"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}/>
                        <Input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}/>

                        <Button type="submit" onClick={signUp}>
                            Sign Up
                        </Button>
                    </form>
                </div>
            </Modal>

            <Modal open={openSignIn} onClose={() => setOpenSignIn(false)}>
                <div style={modalStyle} className={classes.paper}>
                    <form className="app__signup">
                        <center>
                            <h1 className="app_logo">
                                Vartalapp
                            </h1>
                        </center>
                        <Input
                            type="text"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}/>
                        <Input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}/>

                        <Button type="submit" onClick={signIn}>
                            Sign In
                        </Button>
                    </form>
                </div>
            </Modal>

            <div className="app__header">
                <h1 className="app_logo">
                    Vartalapp
                </h1>
                {
                    user
                        ? (
                        <div className="app_userheader">
                            <div className="app_searchbox">
                            <TextField                             
                            id="outlined-search" 
                            label="Search " 
                            type="search"
                            variant="outlined" />
                            </div>
                            <div className="app_userinfo">                                 
                                <Avatar
                                    className="app__avatar"
                                    alt={username}
                                    src="/static/images/avatar/2.jpg"/>
                                <div className="app__logoutContainer">
                                    <Button onClick={() => auth.signOut()}>Logout</Button>
                                </div>
                            </div>
                            </div>
                        )
                        : (
                            <div className="app__loginContainer">
                                <Button onClick={() => setOpenSignIn(true)}>Sign In</Button>
                                <Button onClick={() => setOpen(true)}>Sign Up</Button>
                            </div>
                        )
                }
            </div>
            {
                user
                    ?.displayName
                        ? (
                            <div>
                                <div className="app__posts">
                                    {
                                        posts.map(({id, post}) => (
                                            <Post
                                                key={id}
                                                postId={id}
                                                imageUrl={post.imageUrl}
                                                username={post.username}
                                                caption={post.caption}
                                                user={user}/>
                                        ))
                                    }
                                </div>
                                <div className="app_bottom">
                                    <div className="app_postion">
                                    <Button className="app_addpostbutton" onClick={() => setOpenAddPost(true)}>
                                        <img
                                        className="app_addposticon"
                                        src="https://image.flaticon.com/icons/svg/1004/1004759.svg"
                                        alt="Add Post"/>
                                        Add post
                                    </Button>
                                    </div>
                                </div>
                            </div>

                        )
                        : (
                            <h3 className="app__loginmessage">
                                Sorry! you need to login to upload
                            </h3>
                        )
            }
            <Modal open={openaddpost} onClose={() => setOpenAddPost(false)}>
                <div style={modalStyle} className={classes.paper}>
                    <form className="app__signup">
                        {
                            user
                                ?.displayName
                                    ? (<ImageUpload username={user.displayName}/>)
                                    : (
                                        <h3 className="app__loginmessage">
                                            Sorry! Something went wrong...
                                        </h3>
                                    )
                        }
                    </form>
                </div>
            </Modal>

        </div>
    );
}

export default App;
