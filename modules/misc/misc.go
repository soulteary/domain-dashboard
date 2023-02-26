package misc

import (
	"net/url"
	"strings"

	"github.com/gin-gonic/gin"
)

func IndexHandler(c *gin.Context) {
	c.Redirect(302, "/dashboard/")
	c.Abort()
}

func IsDomainName(str string) bool {
	if _, err := url.Parse(str); err != nil {
		return false
	}
	return true
}

func SplitArray(arr []string, size int) (result [][]string) {
	for i := 0; i < len(arr); i += size {
		end := i + size
		if end > len(arr) {
			end = len(arr)
		}
		result = append(result, arr[i:end])
	}
	return result
}

func GetLines(content string) (result []string) {
	lines := strings.Split(string(content), "\n")
	for _, v := range lines {
		line := strings.TrimSpace(v)
		if line != "" {
			result = append(result, line)
		}
	}
	return result
}
