package assets

import (
	"crypto/md5"
	"embed"
	"fmt"
	"io/fs"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/soulteary/domain-dashboard/modules/state"
)

// TODO 自动更新静态资源文件
//go:generate cp embed/assets ./static/

//go:embed static/favicon.ico
var Favicon embed.FS

//go:embed static
var Static embed.FS

func RegisterRouting(router *gin.Engine) {
	router.Use(optimizeResourceCacheTime())
	router.GET("/favicon.ico", func(c *gin.Context) {
		c.Header("Cache-Control", "public, max-age=31536000")
		c.FileFromFS("favicon.ico", http.FS(Favicon))
	})
	if state.AppIsDebugMode {
		router.StaticFS("/assets/", http.Dir("embed/assets/"))
	} else {
		stripStatic, _ := fs.Sub(Static, "static")
		router.StaticFS("/assets/", http.FS(stripStatic))
	}
}

// ViewHandler support dist handler from UI
// https://github.com/gin-gonic/gin/issues/1222
func optimizeResourceCacheTime() gin.HandlerFunc {
	data := []byte(time.Now().String())
	etag := fmt.Sprintf("W/%x", md5.Sum(data))
	return func(c *gin.Context) {
		if strings.HasPrefix(c.Request.RequestURI, "/assets/") ||
			strings.HasPrefix(c.Request.RequestURI, "/favicon.ico") {
			c.Header("Cache-Control", "public, max-age=31536000")
			c.Header("ETag", etag)

			if match := c.GetHeader("If-None-Match"); match != "" {
				if strings.Contains(match, etag) {
					c.Status(http.StatusNotModified)
					return
				}
			}
		}
	}
}
