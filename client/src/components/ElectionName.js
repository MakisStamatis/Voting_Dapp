import React from 'react';


const ElectionName = () => (
    <div className="election_name">
         <p><span style={{fontWeight:"bold"}}>Election Name: </span> {localStorage.getItem('ChoosenElectionName')} </p>
    </div>
);

export default ElectionName;