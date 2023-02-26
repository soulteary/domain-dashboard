package health

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

var AppHealth bool

func IsHealthy() bool {
	// TODO
	return true
}

func HealthHandler(c *gin.Context) {
	if IsHealthy() {
		c.JSON(http.StatusOK, gin.H{"message": "it works."})
	} else {
		c.JSON(http.StatusOK, gin.H{"message": "not ready."})
	}
}
