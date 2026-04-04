# LoanSphere — React Frontend

## Where to Extract This Folder
Extract the zip anywhere on your machine. Recommended:
```
C:\Projects\loan-ui        (Windows)
~/Projects/loan-ui         (Mac/Linux)
```

## Setup & Run (Local)

### Prerequisites
- Node.js installed (https://nodejs.org — download LTS version)
- Spring Boot backend running on port 8081

### Steps
1. Open terminal inside the `loan-ui` folder
2. Install dependencies:
   ```
   npm install
   ```
3. Start the app:
   ```
   npm start
   ```
4. Opens at → http://localhost:3000

## Switching to Render (Deployment)

1. Deploy your Spring Boot backend on Render
2. Open `.env` file in the loan-ui folder
3. Comment out the localhost line
4. Uncomment and update the Render URL:
   ```
   REACT_APP_API_URL=https://your-spring-boot-app.onrender.com
   ```
5. Run `npm run build` to create production build
6. Deploy the `build/` folder on Render as a Static Site

## Also add CORS on your Spring Boot for Render
In SecurityConfig.java, update @CrossOrigin:
```java
@CrossOrigin(origins = {"http://localhost:3000", "https://your-react-app.onrender.com"})
```

## Features
- Login / Register (User & Admin)
- Apply for loan with eligibility validation
- Admin approve / reject with reason
- View full EMI schedule
- Make payments installment by installment
- Payment history tracking
- Outstanding balance display
