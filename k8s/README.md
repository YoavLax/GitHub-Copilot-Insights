# Kubernetes Deployment Configuration

This directory contains example Kubernetes manifests for deploying GitHub Copilot Insights.

## Setup Instructions

1. **Copy example files to create your configurations:**
   ```bash
   cp deployment.example.yaml deployment.yaml
   cp service.example.yaml service.yaml
   cp ingress.example.yaml ingress.yaml
   cp api-deployment.example.yaml api-deployment.yaml
   cp api-service.example.yaml api-service.yaml
   ```

2. **Update the configurations with your values:**
   - Replace `default` namespace with your namespace
   - Replace `your-registry.azurecr.io` with your container registry
   - Replace `copilot-insights.example.com` with your domain
   - Update `ingressClassName` to match your ingress controller
   - Add node selectors if using specific node pools
   - In `../nginx.conf`: Update `proxy_pass` URL to match your API service (e.g., `http://copilot-insights-api.your-namespace.svc.cluster.local:3001/api/`)

3. **Deploy to Kubernetes:**
   ```bash
   # Deploy frontend
   kubectl apply -f deployment.yaml
   kubectl apply -f service.yaml
   kubectl apply -f ingress.yaml

   # Optional: Deploy API server for persistence
   kubectl apply -f api-deployment.yaml
   kubectl apply -f api-service.yaml
   ```

## Files

- `*.example.yaml` - Example Kubernetes configurations (committed to git)
- `*.yaml` - Your actual configurations (ignored by git, contains private data)

> **Note:** The `nginx.conf` file in the project root contains the nginx configuration with a placeholder API service URL (`your-api-service:3001`). Update this to match your backend API service URL when deploying with server-side persistence.

## Notes

- The actual `*.yaml` files are gitignored to prevent committing private data (domains, registries, namespaces)
- All configurations use non-root users and dropped capabilities for security
- Frontend uses nginx user (UID 101), API uses UID 1000
- Health check endpoints are configured on `/health`
