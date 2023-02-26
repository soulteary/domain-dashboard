package session

import (
	"github.com/gin-gonic/gin"
)

func NeedLoginFirst() gin.HandlerFunc {
	return func(c *gin.Context) {
		// TODO deps community votes
	}
}
