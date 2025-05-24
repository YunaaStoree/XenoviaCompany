# Gunakan image Node.js LTS
FROM node:18

# Set direktori kerja di container
WORKDIR /app

# Salin semua file ke container
COPY . .

# Install semua dependencies
RUN npm install

# Jalankan bot saat container mulai
CMD ["node", "main.js"]
