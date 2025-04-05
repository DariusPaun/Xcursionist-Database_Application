'use client';
import React from 'react';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data_people: [], // Store the complete person data here
    };
  }

  callAPI() {
    fetch("http://localhost:9000/api")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        return res.json(); // Parse response as JSON
      })
      .then((data) => {
        // Update the state with the full data
        this.setState({ data_people: data });
      })
      .catch((err) => console.error("Error fetching /api:", err));
  }

  componentDidMount() {
    this.callAPI(); // Call the API after the component mounts
  }

  render() {
    return (
      <div className="App">
        <header className="App-header"></header>
        <ul>
          {/* Map through the data_people array and display each person's information */}
          {this.state.data_people.map((person, index) => (
            <li key={index}>
              {index + 1}. {person.Nume_Complet} - {person.SEX} - {person.varsta} years old
              <br />
              Bani cheltuiti: {person.Bani_cheltuiti} - Nr. excursii: {person.Nr_excursii}
            </li>
          ))}
        </ul>
      </div>
    );
  }
}

export default App;
