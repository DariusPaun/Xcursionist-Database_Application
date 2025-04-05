'use client';
import React from 'react';
import { Button } from './ui/button';
//import CardWithForm from './excursii_card';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/SideBar";
import { Import } from 'lucide-react';
import CardWithForm from './excursii_card';
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data_peopele: ""
    };
  }

  // Function to make API calls
  callAPI() {
   
    fetch("http://localhost:9000/api")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => console.log("Data from /api/data:", data))
      .catch((err) => console.error("Error fetching /api/data:", err));
  }

  // Using componentDidMount for API call after component mounts
  componentDidMount() {
    this.callAPI();
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
        <SidebarProvider>
      <AppSidebar />
      <main>
        <SidebarTrigger />
        
      </main>
    </SidebarProvider>
        </header>

      </div>
    );
  }
}

export default App;
