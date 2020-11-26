import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import './bootstrap.min.css';
import '../node_modules/mdbootstrap/css/mdb.min.css';
import '../node_modules/mdbootstrap/css/style.css';

import HomePage from './components/HomePage';
import AddCandidate from './components/AddCandidate';
import Candidates from './components/Candidates';
import ApplyToVote from './components/ApplyToVote';
import VerifyVoter from './components/VerifyVoter';
import Vote from './components/Vote';
import Result from './components/Result';
import Start_End from './components/Start_End';
import Footer from './components/Footer';


import { Router , Switch , Route } from 'react-router-dom';
import history from './history'


ReactDOM.render(
    <Router history={history}>
        <Switch>
            <Route exact path="/" component={HomePage} />
            <Route path='/AddCandidate' component={AddCandidate} />
            <Route path='/Candidates' component={Candidates} />
            <Route path='/ApplyToVote' component={ApplyToVote} />
            <Route path='/VerifyVoter' component={VerifyVoter} />
            <Route path='/Vote' component={Vote} />
            <Route path='/Result' component={Result} />
            <Route path='/Start_End' component={Start_End} />
        </Switch>
        <Footer/>
    </Router>,
    document.getElementById('root')
)
