# Wizarding World Full-Stack Application 🪄

An interactive full-stack application built with a **Spring Boot** REST backend and a modern web **frontend**. The project features domain-driven data management for magical entities including Hogwarts Houses, Wand configurations, and Patronus charms.

---

## 📁 Repository Structure

This repository is organized as a monorepo dividing backend services and frontend user interface:

```text
.
├── backend/                  # Spring Boot application & data seeding
│   ├── src/                  # Java source code and resources
│   ├── seed-*.mjs            # Data seeding scripts (Houses, Wands, Patronuses)
│   ├── *.json                # Initial dataset definitions
│   ├── pom.xml               # Maven configuration
│   └── mvnw / mvnw.cmd       # Maven wrapper scripts
└── frontend/                 # Web client application
```

---

## 🛠️ Tech Stack

### **Backend**
* **Framework:** Java / Spring Boot
* **Build Tool:** Apache Maven
* **Data Seeding:** Node.js (`.mjs` scripts) & JSON datasets

### **Frontend**
* **Client App:** Modern JavaScript/TypeScript web interface (located in `/frontend`)

---

## 🚀 Getting Started

### **Prerequisites**
* **Java:** JDK 17 or higher
* **Node.js:** v18+ (for running seed scripts and frontend tools)
* **Git:** Version control

---

### **1. Running the Backend Service**

Navigate into the `backend` directory and start the Spring Boot application using the wrapper:

```bash
cd backend
./mvnw spring-boot:run
```

The API server will launch by default on `http://localhost:8080`.

#### **Data Seeding**
To populate initial entity data (Houses, Wands, Patronus Charms), execute the seed scripts from within the `backend` directory:

```bash
cd backend

# Seed Houses data
node seed-houses.mjs

# Seed Wand configurations
node seed-wands.mjs

# Seed Patronus Charms data
node seed-patronusCharms.mjs
```

---

### **2. Setting up the Frontend**

Navigate to the `frontend` directory to install dependencies and run the client dev server:

```bash
cd frontend

# Install dependencies (npm / pnpm / yarn)
npm install

# Start development server
npm run dev
```

---

## ⚡ Data Models & Resources

The backend manages core entities including:

* **Houses:** Gryffindor, Slytherin, Ravenclaw, Hufflepuff characteristics and traits.
* **Wands:** Wood types, core materials, length, and flexibility properties.
* **Patronuses:** Unique animal shapes and spell casting attributes.

---

## 📝 Development Guidelines

* **Commit Messages:** Follow standard conventional commit formats (e.g., `feat:`, `fix:`, `chore:`).
* **Environment Configuration:** Store environment-specific secrets in `.env` files or application properties (ensure credentials are added to `.gitignore`).

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).