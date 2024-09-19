package main

import (
	"flag"
	"fmt"
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"
	"path/filepath"
	"strings"
)

func main() {
	// Define command-line flags
	port := flag.Int("port", 3000, "Port to serve on")
	proxyURL := flag.String("proxy", "http://localhost:8081", "URL to proxy requests to")
	staticDir := flag.String("dir", "build", "Directory containing static files")
	flag.Parse()

	// Create a reverse proxy
	target, err := url.Parse(*proxyURL)
	if err != nil {
		log.Fatal(err)
	}
	proxy := httputil.NewSingleHostReverseProxy(target)

	// Serve static files
	fs := http.FileServer(http.Dir(*staticDir))

	// Define the handler function
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		// Check if the file exists in the static directory
		path := filepath.Join(*staticDir, r.URL.Path)
		_, err := os.Stat(path)
		if os.IsNotExist(err) {
			// Check if the request accepts HTML
			if !strings.Contains(r.Header.Get("Accept"), "text/html") {
				// Request doesn't accept HTML, proxy the request
				proxy.ServeHTTP(w, r)
			} else {
				// Request accepts HTML, serve the index.html file
				http.ServeFile(w, r, filepath.Join(*staticDir, "index.html"))
			}
		} else {
			// File exists, serve it
			fs.ServeHTTP(w, r)
		}
	})

	// Start the server
	addr := fmt.Sprintf(":%d", *port)
	log.Printf("Server starting on %s", addr)
	log.Fatal(http.ListenAndServe(addr, nil))
}
