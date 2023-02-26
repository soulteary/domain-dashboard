package cmd

import (
	"context"
	"net/http"
	"os/signal"
	"strconv"
	"syscall"
	"time"

	"github.com/gin-contrib/gzip"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/csrf"

	"github.com/soulteary/domain-dashboard/modules/api"
	"github.com/soulteary/domain-dashboard/modules/assets"
	"github.com/soulteary/domain-dashboard/modules/dashboard"
	"github.com/soulteary/domain-dashboard/modules/health"
	"github.com/soulteary/domain-dashboard/modules/logger"
	"github.com/soulteary/domain-dashboard/modules/misc"
	"github.com/soulteary/domain-dashboard/modules/session"
	"github.com/soulteary/domain-dashboard/modules/state"
)

func startDaemon() {
	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	if !state.AppIsDebugMode {
		gin.SetMode(gin.ReleaseMode)
	}

	r := gin.Default()
	log := logger.GetLogger()

	if !state.AppIsDebugMode {
		r.Use(gzip.Gzip(gzip.DefaultCompression))
	}

	// 注册 `/favicon.ico` 和 `/assets`
	assets.RegisterRouting(r)
	r.LoadHTMLGlob("embed/templates/*")

	r.GET("/", misc.IndexHandler)
	// TODO deps community votes
	// r.GET("/login", controllers.LoginHandlerForm)
	// r.POST("/login", controllers.LoginHandler)
	// r.GET("/logout", controllers.LogoutHandler)
	// r.GET("/redirect-to-login", controllers.KeepRedirectQueryToCookie)

	dashHandler := r.Group("/dashboard")
	dashHandler.Use(session.NeedLoginFirst())
	{
		dashHandler.GET("", dashboard.DashboardHandler)
	}

	apiHandler := r.Group("/api")
	apiHandler.Use(session.NeedLoginFirst())
	{
		apiHandler.GET("", api.ApiHandler)
		apiHandler.GET("/", api.ApiHandler)
	}

	r.GET("/health", health.HealthHandler)

	srv := &http.Server{
		Addr:    ":" + strconv.Itoa(3000),
		Handler: csrf.Protect([]byte(state.TOKEN_CSRF), csrf.CookieName("_csrf"), csrf.Secure(false))(r),
	}

	go func() {
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("程序启动出错: %s\n", err)
		}
	}()
	log.Println("程序已启动完毕 🚀")

	<-ctx.Done()

	stop()
	log.Println("程序正在关闭中，如需立即结束请按 CTRL+C")

	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()
	if err := srv.Shutdown(ctx); err != nil {
		log.Fatal("程序强制关闭: ", err)
	}

	log.Println("期待与你的再次相遇 ❤️")
}
