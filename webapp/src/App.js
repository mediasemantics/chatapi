import React, { Component } from 'react';
import { Widget, addResponseMessage } from 'react-chat-widget';
import './App.css';
import './styles.css';

class App extends Component {
    
    constructor(props, context) {
        super(props, context);
        
        this.idleTimeout = 0;

        // If you DON'T have a login/authentication system, then this  mechanism can at least give
        // you a stable userid that lets you remember a user from login to login, provided that they
        // login from the same device. Please refer also to privacy laws governing the use of cookies.
        this.userid = this.getCookie("userid");
        // Otherwise we generate our own using the timestamp and some random digits
        if (!this.userid) {
            this.userid = (new Date()).getTime().toString();
            for (var i = 0; i <= 3; i++)
                this.userid += Math.floor(Math.random()*10);
            this.setCookie("userid", this.userid, 365);
        }
    }  

    render() {
        return (
            <div className="App">
                <Widget handleNewUserMessage={this.reply.bind(this)}
                    title="Your title here"
                    subtitle="Your subtitle here"
                    autofocus={true}/>
            </div>
        );
    }

    reply(input) {
        this.clearIdle();
        let xhr = new XMLHttpRequest();
        xhr.open('GET', "http://localhost:3000/reply?userid=" + this.userid + "&input=" + encodeURIComponent(input), true);
        xhr.onload = function () {
            let ret = JSON.parse(xhr.response);
            if (ret.output) addResponseMessage(ret.output);
            if (ret.idle) this.setIdle(ret.idle)
        };
        xhr.send();
    }
    
    // Idle support
    setIdle(secs) {
        this.clearIdle();
        this.idleTimeout = setTimeout(this.onIdle.bind(this, secs), secs*1000);
    }

    clearIdle() {
        if (this.idleTimeout) {
            clearTimeout(this.idleTimeout);
            this.idleTimeout = 0;
        }
    }

    onIdle(n) {
        this.reply("[idle " + n + "]");
    }
    
    // Autostart
    
    componentDidMount() {
        setTimeout(() => {
            this.reply("[auto " + new Date().getTimezoneOffset() + "]")
        }, 250);
    }
    
    // Cookie support
    
    getCookie(name) {
        let v = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
        return v ? v[2] : null;
    }

    setCookie(name, value, days) {
        let d = new Date();
        d.setTime(d.getTime() + 24*60*60*1000*days);
        document.cookie = name + "=" + value + ";path=/;expires=" + d.toGMTString();
    }
}

export default App;
