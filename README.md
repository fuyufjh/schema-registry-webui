# Schema Registry WebUI

This project is a web-based user interface for managing Apache Kafka Schema Registry. It provides a user-friendly way to interact with schemas, subjects, and configurations in your Schema Registry.

## Features

1. **Subject Management**
   - View all subjects
   - Create new subjects
   - Edit existing schemas
   - Delete subjects
   - View schema versions

2. **Configuration Management**
   - Manage global and subject-specific configurations
   - Set compatibility levels
   - Configure schema normalization
   - Set aliases
   - Manage read/write modes

3. **Schema Viewing and Editing**
   - View schema details in a formatted JSON viewer
   - Edit schemas with a code editor
   - Prettify schema JSON

## Development

1. Clone the repository
2. Install dependencies with `npm install`
3. Start the development server with `npm start`
4. Access the application at `http://localhost:3000`

Note: Make sure you have a running Schema Registry instance and update the API endpoint in the configuration if necessary.
