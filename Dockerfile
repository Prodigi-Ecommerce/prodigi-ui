# Step 1: Build the Vite app
FROM node:22-alpine AS build

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to install dependencies
COPY package*.json ./

# Copy the .env file into the image
COPY .env .env

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Build the Vite app for production
RUN npm run build

# Step 2: Create a production-ready image with Nginx
FROM nginx:alpine

# Copy the build output to the Nginx server's root directory
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose the default HTTP port (80)
EXPOSE 80

# Start the Nginx server
CMD ["nginx", "-g", "daemon off;"]