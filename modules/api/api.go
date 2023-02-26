package api

import (
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/soulteary/domain-dashboard/modules/misc"
)

type Domains struct {
}

type Response struct {
	Favorite   []string   `json:"favorite"`
	Aliyun     [][]string `json:"aliyun"`
	Qcloud     [][]string `json:"qcloud"`
	Namesilo   [][]string `json:"namesilo"`
	Cloudflare [][]string `json:"cloudflare"`
}

func ApiHandler(c *gin.Context) {
	data := LoadData()
	c.JSON(200, data)
}

func processAliyun(lines []string) (domains [][]string) {
	chunks := misc.SplitArray(lines, 10)
	for _, v := range chunks {
		if misc.IsDomainName(v[0]) && len(v) >= 5 {
			var domain []string
			domain = append(domain, v[0])
			domain = append(domain, v[4])
			domain = append(domain, v[5])
			domains = append(domains, domain)
		}
	}
	return domains
}

func processQcloud(lines []string) (domains [][]string) {
	chunks := misc.SplitArray(lines, 10)
	var dateTimeRegexp = regexp.MustCompile(`\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}`)
	for _, v := range chunks {
		if misc.IsDomainName(v[0]) && len(v) >= 4 {
			var domain []string
			domain = append(domain, v[0])
			domain = append(domain, dateTimeRegexp.FindString(v[3]))
			domain = append(domain, dateTimeRegexp.FindString(v[4]))
			domains = append(domains, domain)
		}
	}
	return domains
}

func processFavorite(lines []string) (domains []string) {
	for _, v := range lines {
		if misc.IsDomainName(v) {
			domains = append(domains, v)
		}
	}
	return domains
}

func processNamesilo(lines []string) (domains [][]string) {
	for _, v := range lines {
		item := strings.Split(v, "\t")
		if misc.IsDomainName(item[0]) && len(item) >= 6 {
			var domain []string
			domain = append(domain, item[0])
			domain = append(domain, item[3])
			domain = append(domain, item[4])
			domains = append(domains, domain)
		}
	}
	return domains
}

func processCloudflare(lines []string) (domains [][]string) {
	chunks := misc.SplitArray(lines, 3)
	var dateTimeRegexp = regexp.MustCompile(`\w+\s\d+,\s\d{4}`)
	for _, v := range chunks {
		var domain []string
		domain = append(domain, v[0])
		domain = append(domain, "")
		domain = append(domain, dateTimeRegexp.FindString(v[2]))
		domains = append(domains, domain)
	}
	return domains
}

func LoadData() (domains Response) {
	dir := "data"

	err := filepath.Walk(dir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		fileToLower := strings.ToLower(path)
		if !info.IsDir() && strings.HasSuffix(fileToLower, ".txt") {
			fileContent, err := os.ReadFile(path)
			if err != nil {
				return err
			}

			lines := misc.GetLines(string(fileContent))
			if strings.Contains(fileToLower, "favorite") {
				domains.Favorite = processFavorite(lines)
			}

			if strings.Contains(fileToLower, "aliyun") {
				domains.Aliyun = processAliyun(lines)
			}

			if strings.Contains(fileToLower, "qcloud") {
				domains.Qcloud = processQcloud(lines)
			}

			if strings.Contains(fileToLower, "namesilo") {
				domains.Namesilo = processNamesilo(lines)
			}

			if strings.Contains(fileToLower, "cloudflare") {
				domains.Cloudflare = processCloudflare(lines)
			}
		}

		return nil
	})

	if err != nil {
		fmt.Println(err)
	}

	return domains
}
