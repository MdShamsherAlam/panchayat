# Project Architecture

## Data Flow
`Request -> Dispatcher -> Controller -> Service -> Model -> Database`

## Patterns
- **Indexing**: Every folder has an `index.js/jsx` for clean imports.
- **Transactions**: All state-changing operations are wrapped in Sequelize transactions in the Controller layer.
- **Camelization**: Response data is automatically converted to camelCase in the Dispatcher.
- **Correlation**: `X-Request-Id` is used to track requests across logs and responses.
