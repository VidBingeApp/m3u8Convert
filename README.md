# HLS to Video

HLS to Video is a web application that converts m3u8 streams to mp4 video files. This application provides real-time progress updates during the conversion process using Pusher.

## Features

- Convert m3u8 streams to mp4 video files
- Real-time conversion progress updates
- Download the converted video file

## Prerequisites

- Node.js
- FFmpeg
- Pusher account

## Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/joshholly/m3u8Convert.git
    cd m3u8Convert
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

3. Install FFmpeg:
   - **For macOS**: Use Homebrew
     ```bash
     brew install ffmpeg
     ```
   - **For Ubuntu**:
     ```bash
     sudo apt update
     sudo apt install ffmpeg
     ```
   - **For Windows**:
     Download FFmpeg from the official site and add it to your PATH.

4. Create a `.env` file:

    Copy the `.env.example` file to `.env`:

    ```bash
    cp .env.example .env
    ```

    Fill in your Pusher credentials in the `.env` file:

    ```env
    PUSHER_APP_ID=your_pusher_app_id
    PUSHER_KEY=your_pusher_key
    PUSHER_SECRET=your_pusher_secret
    PUSHER_CLUSTER=your_pusher_cluster
    ```

### FOR ADVANCED USERS ONLY

If you prefer to set your environment variables directly in the application setup (e.g., through your hosting provider's interface) rather than using a `.env` file, follow these steps:

1. Remove the line `require('dotenv').config();` from the top of `app.js`.
2. Ensure your Pusher credentials (`PUSHER_APP_ID`, `PUSHER_KEY`, `PUSHER_SECRET`, `PUSHER_CLUSTER`) are correctly set as environment variables in your application setup.


## Usage

1. Start the server:

    ```bash
    npm start
    ```

2. Open your browser and navigate to:

    ```plaintext
    http://localhost:3000/?url=YOUR_M3U8_URL
    ```

    Replace `YOUR_M3U8_URL` with the actual m3u8 URL you want to convert.

## Project Structure

- `app.js`: The main server-side script.
- `index.html`: The HTML file served to clients.
- `tmp/`: Directory where temporary files are stored.

## License

This project is licensed under the MIT License. See the [LICENSE](https://www.tldrlegal.com/license/mit-license) file for details.

## Acknowledgements

- [Pusher](https://pusher.com/) for providing real-time updates.
- [FFmpeg](https://ffmpeg.org/) for handling media conversion.

## Contributing

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Make your changes.
4. Commit your changes (`git commit -am 'Add new feature'`).
5. Push to the branch (`git push origin feature-branch`).
6. Create a new Pull Request.

