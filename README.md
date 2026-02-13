# World Wide News

This website is a news application built using a custom MVC architecture and a RESTful JSON API secured with JWT authentication.

The application supports three types of users:
- Not logged-in users – can only view published news.
- Logged-in users – authenticated via JWT; can view news, add comments, and delete their own comments.
- Administrators – authenticated via JWT with elevated privileges; can add and delete news, add comments, and remove any comment in the system.

User access control is enforced through middleware at the API level, while the frontend consumes the backend via secure HTTP requests using Bearer tokens.

## Technologies

**Frontend**
- TypeScript
- React (^19.2)
- React Router DOM (^7.6)
- Vite (^7.3)
- Bootstrap (^5.3)

**Backend**
- PHP
- MySQL

## Setup & Run the App

1. **Database:** Import news_db.sql located in the root directory into your MySQL server. 

2. **Server Configuration:** Update your server /server/config/database.php file to match your local database credentials:

declare(strict_types=1);

return [

    'host' => getenv('DB_HOST') ?: 'localhost',

    'username' => getenv('DB_USER') ?: 'root',

    'password' => getenv('DB_PASS') ?: '',

    'database' => getenv('DB_NAME') ?: 'news_db',

    'charset' => 'utf8mb4',

];

3. Install dependencies:
- Navigate to the client directory and run: npm install
- Navigate to the server directory and run: composer install

4. Run the App:
This application requires a local Apache HTTP Server to be running, the project must be placed inside the Apache web root directory www
- From the client directory: npm run dev

5. Run the tests
- Navigate to the server directory and run the command composer test.
- Navigate to the client directory and run the command npm run test.
 
<img width="1895" height="742" alt="wwn-slika" src="https://github.com/user-attachments/assets/2d2b83a3-9e42-453e-b8f6-3aebbc23fcd0" />


![news_db](https://github.com/user-attachments/assets/82853684-053e-4fa1-9e94-666bcd00dab0)

