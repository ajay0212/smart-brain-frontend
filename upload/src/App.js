import React, {Component} from 'react';
import Particles from 'react-tsparticles';
import Navigation from './components/Navigation/Navigation.js';
import Signin from './components/Signin/Signin.js';
import Register from './components/Register/Register.js';
import FaceRecognition from './components/FaceRecognition/FaceRecognition.js';
import Logo from './components/Logo/Logo.js';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm.js';
import Rank from './components/Rank/Rank.js';
import './App.css';

window.process = {
    env: {
        NODE_ENV: 'development'
    }
}    

const particlesOptions={
        backgroundMode: {
          enable: true,
          zIndex: 0
        },
        fpsLimit: 60,
        interactivity: {
          detectsOn: "canvas",
          events: {
            onClick: { enable: true, mode: "repulse" },
            onHover: {
              enable: true,
              mode: "bubble",
              parallax: { enable: false, force: 2, smooth: 10 }
            },
            resize: true
          },
          modes: {
            bubble: {
              distance: 400,
              duration: 0.3,
              opacity: 1,
              size: 4,
              speed: 3
            },
            grab: { distance: 400, line_linked: { opacity: 0.5 } },
            push: { particles_nb: 4 },
            remove: { particles_nb: 2 },
            repulse: { distance: 200, duration: 0.4 }
          }
        },
        particles: {
          color: { value: "#fff" },
          links: {
            color: "#ffffff",
            distance: 500,
            enable: false,
            opacity: 0.4,
            width: 2
          },
          move: {
            attract: { enable: false, rotateX: 600, rotateY: 1200 },
            direction: "bottom",
            enable: true,
            outMode: "out",
            random: false,
            size: true,
            speed: 4,
            straight: false
          },
          number: { density: { enable: true, area: 800 }, value: 400 },
          opacity: {
            random: true,
            value: 0.5
          },
          shape: {
            type: "circle"
          },
          size: {
            random: true,
            value: 10
          }
        },
        detectRetina: true
      }

const initialState={
      input:'',
      imageUrl: '',
      box: {},
      route: 'signin',
      isSignedIn: false,
      user: {
        id: '',
        name: '',
        email: '',
        entries: 0,
        joined: ''
      }
    }


class App extends Component {
  constructor(){
    super();
    this.state=initialState;
    }

  loadUser = (data) => {
    this.setState({user: {
        id: data.id,
        name: data.name,
        email: data.email,
        entries: data.entries,
        joined: data.joined
    }})
  }

  calculateFaceLocation = (data) => {
      const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
      const image = document.getElementById('inputimage');
      const width = Number(image.width);
      const height = Number(image.height);
      return {
        leftCol: clarifaiFace.left_col*width,
        topRow: clarifaiFace.top_row*height,
        rightCol: width - clarifaiFace.right_col*width,
        bottomRow: height - clarifaiFace.bottom_row*height
      }
  }
  displayFacebox = (box) => {
    this.setState({box: box});
  }
  onInputChange = (event) => {
    this.setState({input: event.target.value})
  }
   
   onButtonSubmit = () => {
    this.setState({imageUrl: this.state.input})
fetch('https://infinite-depths-44743.herokuapp.com/imageurl', {
            method: 'post',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
              input: this.state.input
            })
          })
     .then(response => response.json())
     .then(response => {
        if (response) {
          fetch('https://infinite-depths-44743.herokuapp.com/image', {
            method: 'put',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
              id: this.state.user.id
            })
          })
            .then(response => response.json())
            .then(count => {
              this.setState(Object.assign(this.state.user, { entries: count}))
            })
            .catch(console.log)

        }
        this.displayFacebox(this.calculateFaceLocation(response))
      })
      .catch(err => console.log(err));
  }

  onRouteChange = (route) => {
    if(route=== 'signout'){
      this.setState(initialState);
    } else if(route==='home'){
      this.setState({isSignedIn:true})
    }
    this.setState({route:route});
  }

  render(){
    return(
    <div className="App">
      <Particles className='particles'
              params={particlesOptions}
      />
      <Navigation onRouteChange={this.onRouteChange} isSignedIn={this.state.isSignedIn}/>
      { this.state.route==='home'?
        <div>
        <Logo />
        <Rank name={this.state.user.name} entries={this.state.user.entries}/>
        <ImageLinkForm onInputChange={this.onInputChange} onButtonSubmit={this.onButtonSubmit}/>
        <FaceRecognition imageUrl={this.state.imageUrl} box={this.state.box}/>
        </div>
        
        :(
          this.state.route==='signin'
          ?<Signin onRouteChange={this.onRouteChange} loadUser={this.loadUser}/>
          :<Register onRouteChange={this.onRouteChange} loadUser={this.loadUser}/>
          )
      
    
      
      }
    </div>
    );
  }
}

export default App;
