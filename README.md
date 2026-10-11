# 🛒 Blikit

> A lightning-fast, full-stack quick commerce & grocery delivery platform.

![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)
![MongoDB](https://img.shields.io/badge/MongoDB-Green?style=for-the-badge&logo=mongodb)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css)
![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)

## 📖 Overview

**Blikit** is a comprehensive, full-stack web application inspired by modern quick commerce platforms like Blinkit. It provides users with a seamless grocery shopping experience, complete with real-time order tracking, secure payments, and an intuitive user interface. 

It aims to solve the problem of complex and slow online grocery shopping by providing a highly responsive, animated, and fast frontend combined with a robust backend for real-time operations.

## ✨ Features

- 🔐 **Secure Authentication**: User signup, login, and secure sessions using JWT and bcryptjs.
- 🛍️ **Product Catalog & Categories**: Browse through a wide variety of grocery products with categorized filtering.
- 🛒 **Dynamic Cart & Checkout**: State management via Redux Toolkit for seamless cart updates.
- 💳 **Payment Gateway Integration**: Secure and smooth online payments integrated via Razorpay.
- 🗺️ **Real-Time Order Tracking**: Live delivery tracking using Leaflet Maps and Socket.io.
- 👨‍💻 **Admin Dashboard**: Dedicated admin panel to manage products, categories, and user orders.
- 🖼️ **Cloud Image Storage**: High-performance image serving and management using Cloudinary.
- 📱 **Responsive & Animated UI**: Beautiful, mobile-first design built with Tailwind CSS, Shadcn UI, and Framer Motion.

## 🛠️ Tech Stack

| Category | Technologies |
| :--- | :--- |
| **Frontend** | Next.js (App Router), React 19, Tailwind CSS, Framer Motion, Shadcn UI |
| **Backend** | Next.js API Routes, Node.js, Express (Custom Server) |
| **Database** | MongoDB, Mongoose |
| **State Management** | Redux Toolkit, React-Redux |
| **Real-time & Maps** | Socket.io, Leaflet, React-Leaflet |
| **Authentication** | JSON Web Tokens (JWT), Bcrypt.js |
| **Payments & Media** | Razorpay, Cloudinary |

## 📸 Screenshots / Demo

*Live Demo:* [TODO: Add Live URL]

| Home Page | Shopping Cart |
| :---: | :---: |
| ![Home](https://via.placeholder.com/600x400?text=Home+Page+Screenshot) | ![Cart](https://via.placeholder.com/600x400?text=Cart+Screenshot) |
| **Order Tracking** | **Admin Dashboard** |
| ![Tracking](https://via.placeholder.com/600x400?text=Order+Tracking+Screenshot) | ![Admin](https://via.placeholder.com/600x400?text=Admin+Dashboard+Screenshot) |

*(Note: Replace placeholders with actual screenshot paths)*

## 📂 Folder Structure

```text
blikit/
├── app/                  # Next.js App Router (Pages & API Routes)
│   ├── admin/            # Admin Dashboard views
│   ├── api/              # Backend API Endpoints
│   ├── cart/             # Shopping Cart interface
│   ├── checkout/         # Checkout and payment flow
│   ├── delivery/         # Delivery partner interface
│   ├── orders/           # User order history
│   └── track-order/      # Real-time order tracking map
├── components/           # Reusable UI components (Shadcn, Base UI)
├── lib/                  # Utilities and database configuration
├── public/               # Static assets (images, icons)
├── server.ts             # Custom Node server (for Socket.io)
├── .env.local            # Environment variables
└── package.json          # Project metadata and dependencies
```

## 🚀 Getting Started

Follow these steps to set up the project locally on your machine.

### Prerequisites
- Node.js (v18 or higher)
- pnpm (Package Manager)
- MongoDB Database (Local or MongoDB Atlas)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/blikit.git
   cd blikit
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Set up Environment Variables:**
   Create a `.env.local` file in the root directory and add the following variables:
   ```env
   # Database
   MONGODB_URI=your_mongodb_connection_string

   # Authentication
   JWT_SECRET=your_jwt_secret_key

   # Cloudinary (Image Storage)
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret

   # Razorpay (Payments)
   NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_secret
   ```

4. **Run the development server:**
   ```bash
   pnpm run dev
   ```
   The application will start running on `http://localhost:3000`.

## 📡 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/signup` | Register a new user |
| `POST` | `/api/auth/login` | Authenticate user and return JWT |
| `GET`  | `/api/products` | Fetch all available products |
| `GET`  | `/api/categories`| Fetch product categories |
| `POST` | `/api/orders` | Create a new order after checkout |
| `GET`  | `/api/orders/[id]`| Get specific order details |

## 💻 Usage

1. Create a new user account or log in.
2. Browse products by category or search.
3. Add items to your cart and proceed to checkout.
4. Complete the mock payment via Razorpay.
5. Track your order on the map in real-time.
6. Check your past orders in the account section.

## 🚀 Future Improvements

- [TODO] Implement SMS notifications for order updates.
- [TODO] Add AI-based product recommendations.
- [TODO] Support for multiple delivery addresses.
- [TODO] Enhance the delivery partner portal with route optimization.

## 🤝 Contributing

Contributions are welcome! If you'd like to improve the project, please follow these steps:
1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more information.

## 📬 Author / Contact

**[Your Name / Developer]**
- GitHub: [@yourusername](https://github.com/yourusername)
- LinkedIn: [Your Profile](https://linkedin.com/in/yourusername)
- Email: your.email@example.com

---
*If you like this project, please consider giving it a ⭐ on GitHub!*
