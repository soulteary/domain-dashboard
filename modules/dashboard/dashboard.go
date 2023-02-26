package dashboard

import (
	"github.com/gin-gonic/gin"
	"github.com/gorilla/csrf"
)

func DashboardHandler(c *gin.Context) {
	c.HTML(200, "dashboard.html", gin.H{
		csrf.TemplateTag: csrf.TemplateField(c.Request),
	})
}
