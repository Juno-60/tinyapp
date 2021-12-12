# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly). It's definitely not pretty, but it works*!

Some things to note: 
- All databases are stored in objects, which are cleared when the server resets. Sorry!
- You also have to manually type your shortened URL into the address bar, which makes the
  whole app kinda useless. Maybe I'll fix that once I actually understand HTML.
- Only the bare minimum of requirements are met, because I ran out of time! Whoops!

## Final Product

!["/urls page when not logged in"](https://github.com/Juno-60/tinyapp/blob/master/docs/URLS-page-signed-out.png)

!["/urls page when signed in - with links!"](https://github.com/Juno-60/tinyapp/blob/master/docs/URLS-page-signed-in.png)

## Dependencies

- Node.js
- Express
- EJS
- bcrypt
- body-parser
- cookie-session

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.