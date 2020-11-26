import React from "react";
import VoteContract from "../contracts/VoteContract.json";
import getWeb3 from "../getWeb3";

import NavBarAdmin from './NavBarAdmin';
import NavBar from './NavBar';
import ElectionName from './ElectionName';

import { Button,Spinner } from 'react-bootstrap';


class Admin extends React.Component {
  //constructor of the class
  constructor(props) {
    super(props)

    //set initial state
    this.state = {
      VoteInstance: undefined,
      account: null,
      web3: null,
      isOwner:false,
      start:false,
      end:false,
      election_id:null
    }
  }

  startElection = async () => {
    await this.state.VoteInstance.methods.startElection(this.state.election_id).send({from : this.state.account , gas: 1000000});
    window.location.reload();
  }

  endElection = async () => {
    await this.state.VoteInstance.methods.endElection(this.state.election_id).send({from : this.state.account , gas: 1000000});
    window.location.reload();
  }


  componentDidMount = async () => {
    try {

      this.setState({election_id:localStorage.getItem('ChoosenElectionID')});
      //checking if user has selected an election from Home Page
      if(localStorage.getItem('ChoosenElectionID')){
        // Get network provider and web3 instance.
        const web3 = await getWeb3();

        // Use web3 to get the user's accounts.
        const accounts = await web3.eth.getAccounts();

        // Get the contract instance.
        const networkId = await web3.eth.net.getId();
        const deployedNetwork = VoteContract.networks[networkId];
        const instance = new web3.eth.Contract( VoteContract.abi, deployedNetwork && deployedNetwork.address,);

        // Set web3, accounts, and contract to the state
        this.setState({web3: web3,account: accounts[0], VoteInstance: instance});


        //get owner of the election
        const owner = await this.state.VoteInstance.methods.getElectionOwner(this.state.election_id).call();
        if(this.state.account === owner){
          this.setState({isOwner : true});
        }

        //get status of the election (if it has started or has ended)
        let start = await this.state.VoteInstance.methods.getStart(this.state.election_id).call();
        let end = await this.state.VoteInstance.methods.getEnd(this.state.election_id).call();

        this.setState({start : start, end : end });
      }
      
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  //Used to make the current NavBar element active 
  componentDidUpdate(){
    if(document.getElementById("admin_span") !== null){
      document.getElementById('admin_span').classList.add("text-white");
    }
  }

  render() {

    if(this.state.election_id === null){
      return (
        <div className="App">
        {this.state.isOwner ? <NavBarAdmin /> : <NavBar />}
          <div className="under_nav">
            Please select an election from the home page
          </div>
        </div>
      );
    }

    if (!this.state.web3) {
      return (
        <div className="App">
        {this.state.isOwner ? <NavBarAdmin /> : <NavBar />}
        <div className="under_nav">
          <Spinner animation="border" role="status">
            <span className="sr-only">Loading...</span>
          </Spinner>  
        </div>
        </div>
      );
    }

    if(!this.state.isOwner){
      return(
        <div className="App">
        {this.state.isOwner ? <NavBarAdmin /> : <NavBar />}
        <div className="under_nav">
          NEED ADMIN ACCESS
        </div>
        <ElectionName/>
        </div>
      );
    }
    return (
      <div className="App">
        {this.state.isOwner ? <NavBarAdmin /> : <NavBar />}


        <div className="admin-buttons">
          {this.state.start
            ? <Button className="btn-lg" onClick={this.startElection} disabled variant="custom_green">Start Election</Button>
            : <Button className="btn-lg" onClick={this.startElection} variant="custom_blue">Start Election</Button>
          }
          {this.state.end
            ? <Button className="btn-lg" onClick={this.endElection} disabled variant="custom_green">End Election</Button>
            : <Button className="btn-lg" onClick={this.endElection} variant="custom_blue">End Election</Button>
          }
        </div>


        <ElectionName/>
      </div>
    );
  }
}

export default Admin;