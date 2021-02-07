![Preview](https://res.cloudinary.com/duug1ffde/image/upload/c_scale,q_auto,w_1600/v1612538540/active-learning-combined_s5qq8z.png)

# Active Learning Tools

A web app for gamifying the learning process, similar to how [Kahoot!](https://kahoot.com/) works. Teachers are able to create and host quizzes, allowing students to compete against each other in realtime. Built during my final year of university as part of my dissertation.

This particular repo houses the backend in the form of a REST API for managing the CRUD operations required by the dashboard. It also contains the game logic, which can be located in the `sockets` folder.

Frontend: https://github.com/shaunedwards/quiz-client

## Live Demo

https://quiz.sme.dev

If you don't wish to create your own account, you can login with the following details:

**User:** demouser  
**Pass:** demopass

## Tech Stack

- Node.js
- MongoDB
- Express
- Socket&#46;IO for realtime functionality
- API testing: Mocha, Chai & Supertest

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- Node.js (v12 or later recommended)
- MongoDB server

### Installation

1. Clone the repository
2. Run `npm install` to install the required dependencies (if you're not planning on running tests, you can skip installing dev dependencies using the command `npm install --only=prod`)
3. Create the file `.env` in the root directory using `.env.sample` as an example of how this should be done
4. Run the server using `npm start`
