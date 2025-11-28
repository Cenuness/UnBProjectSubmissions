# 🎓 CESSProjects — UnB Student Submissions

Welcome to CESSProjects, the official GitHub repository for University of Brasília (UnB) students participating in the CESS Network Course.
This repository serves as a collaborative space for students to upload, share, and showcase their projects built using the CESS Network.

## 🌐 About CESS Network

CESS is a Web3 Decentralized Data Infrastructure designed to provide secure, scalable, and privacy-preserving data storage and content delivery.

Students are encouraged to explore, smart contracts, SDKs, and RESTful APIs, integrations while developing their projects.

For documentation and resources:

- [CESS Official Website](https://cess.network)
- [CESS Documentation](https://doc.cess.network)
- [Join the CESS Community](linktr.ee/cessofficial)

## 🧩 Project Guidelines

Please follow these steps carefully to submit your project to this repository.

### 1. Fork the Repository

Click the “Fork” button on the top right of this page to create your own copy of this repository.

### 2. Clone Your Fork

```bash
git clone https://github.com/<your-username>/CESSProjects.git
```

### 3. Create a New Branch

Create a new branch for your project submission.

**Use the format:**

```php-template
<your-name>-<project-name>
```

**Example:**

```bash
git checkout -b alice-example-project
```

### 4. Add Your Project Folder

Create a folder inside the `Season2` directory using the same naming format:

```php-template
Season2/<your-name>-<project-name>
```

Inside your folder, include:

- `README.md` – Project description, setup instructions, and your learnings.
- Source code files (e.g., `.rs`, `.js`, `.py`, `.ink`, etc.)
- Any additional assets (images, demo videos, or datasets).

Example folder structure:

```css
Season2/
├── alice-example-project/
│   ├── README.md
│   ├── src/
│   ├── demo.png
│   └── main.rs
```

### 5. Commit and Push Your Changes

```bash
git add .
git commit -m "Add project: alice-example-project"
git push origin alice-example-project
```

### 6. Submit a Pull Request (PR)

Go to your forked repository on GitHub and click **“Compare & Pull Request”**.
Make sure your PR title follows this format:

```pgsql
Add project: <your-name>-<project-name>
```

Include a brief summary of your project and what technologies you used.

## ✅ Submission Requirements

To ensure your submission is accepted:

- The project folder and branch names must follow the correct format.
- Include a complete README.md explaining:
  - Project title and summary
  - Tools and SDKs used
  - How to run your project
  - What problem it solves or what you learned
- Code should be clean and organized.
- No large binary files (>100 MB) should be uploaded directly.

## 🏆 Evaluation Criteria

Projects will be evaluated based on:

- Functionality – Does your project work as intended?
- Innovation – Does it creatively use CESS technologies?
- Code Quality – Is the code readable and well-structured?
- Documentation – Does your README clearly explain the project?

## 💡 Example Project Ideas

- A decentralized file-sharing app using **SDK**
- A dApp for data ownership verification
- An AI training demo using **CESS Storage**

## 🙌 Need Help?

If you face any issues:

- Open an Issue in this repository with a clear title and description.
- Tag your instructor or the CESS DevRel Team for assistance.
- Join our [Discord](https://discord.com/invite/cess) to connect with dev team and mentors.

## 📅 Submission Deadline

Please submit your pull request before the deadline announced by your instructor.
Late submissions may not be accepted.
