# Ai-Learning-App

# Setup Instructions

Follow these steps to run the project on your system.

## 1. Clone the Repository

Clone the project from GitHub.

```bash
git clone https://github.com/Subhransu26/Ai-Learning-App.git
```

Go into the project folder:

```bash
cd Ai-Learning-App
```

---

## 2. Setup Backend

Go to the Backend folder:

```bash
cd Backend
```

Install required packages:

```bash
npm install
```

Create a `.env` file inside the **Backend** folder and add:

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
```

Run the backend server:

```bash
npm run dev
```

or

```bash
node server.js
```

---

## 3. Setup Frontend

Open a new terminal and go to the frontend folder:

```bash
cd Frontend
```

Install dependencies:

```bash
npm install
```

Start the frontend:

```bash
npm run dev
```

---

## 4. Git Workflow 

Before starting work:

```bash
git pull origin main
```

Create a new branch for your work:

```bash
git checkout -b feature-name
```

After making changes:

```bash
git add .
git commit -m "describe your changes"
git push origin feature-name
```

Create a Pull Request on GitHub to merge into main.
---

## Notes

* Do not push .env or node_modules
* Always run git pull before starting work
* Work on your own branch
* Keep the folder structure unchanged
* If you face errors, reinstall packages using `npm install`.
