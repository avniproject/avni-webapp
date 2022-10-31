package org.avni.server.web;

import org.avni.server.dao.NewsRepository;
import org.avni.server.domain.CHSEntity;
import org.avni.server.domain.News;
import org.avni.server.service.NewsService;
import org.avni.server.service.S3Service;
import org.avni.server.util.S;
import org.avni.server.web.request.NewsContract;
import org.joda.time.DateTime;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.hateoas.Link;
import org.springframework.hateoas.PagedResources;
import org.springframework.hateoas.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.transaction.Transactional;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
public class NewsController extends AbstractController<News> implements RestControllerResourceProcessor<News> {

    private final NewsService newsService;
    private final NewsRepository newsRepository;
    private final S3Service s3Service;

    @Autowired
    public NewsController(NewsService newsService, NewsRepository newsRepository,
                          S3Service s3Service) {
        this.newsService = newsService;
        this.newsRepository = newsRepository;
        this.s3Service = s3Service;
    }

    @GetMapping(value = "/web/news")
    @PreAuthorize(value = "hasAnyAuthority('admin','organisation_admin')")
    @ResponseBody
    @Transactional
    public List<NewsContract> getAll() {
        return newsRepository.findAllByIsVoidedFalse()
                .stream().map(NewsContract::fromEntity)
                .collect(Collectors.toList());
    }

    @GetMapping(value = "/web/publishedNews")
    @PreAuthorize(value = "hasAnyAuthority('admin','user')")
    @ResponseBody
    @Transactional
    public List<NewsContract> getAllPublishedNews() {
        return newsRepository.findByPublishedDateNotNullAndIsVoidedFalse()
                .stream().map(NewsContract::fromEntity)
                .peek(newsContract -> {
                    String signedURL = S.isEmpty(newsContract.getHeroImage()) ? null : s3Service.generateMediaDownloadUrl(newsContract.getHeroImage()).toString();
                    newsContract.setSignedHeroImage(signedURL);
                })
                .collect(Collectors.toList());
    }

    @GetMapping(value = "/web/news/{id}")
    @PreAuthorize(value = "hasAnyAuthority('admin','user')")
    @ResponseBody
    @Transactional
    public ResponseEntity<NewsContract> getById(@PathVariable Long id) {
        Optional<News> news = newsRepository.findById(id);
        return news.map(n -> ResponseEntity.ok(NewsContract.fromEntity(n)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping(value = "/web/news")
    @PreAuthorize(value = "hasAnyAuthority('admin', 'organisation_admin')")
    @ResponseBody
    @Transactional
    public ResponseEntity<NewsContract> newNews(@RequestBody NewsContract newsContract) {
        News news = newsService.saveNews(newsContract);
        return ResponseEntity.ok(NewsContract.fromEntity(news));
    }

    @PutMapping(value = "/web/news/{id}")
    @PreAuthorize(value = "hasAnyAuthority('admin', 'organisation_admin')")
    @ResponseBody
    @Transactional
    public ResponseEntity<NewsContract> editNews(@PathVariable Long id, @RequestBody NewsContract newsContract) {
        Optional<News> news = newsRepository.findById(id);
        if (!news.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        News newNews = newsService.editNews(newsContract, id);
        return ResponseEntity.ok(NewsContract.fromEntity(newNews));
    }

    @DeleteMapping(value = "/web/news/{id}")
    @PreAuthorize(value = "hasAnyAuthority('admin', 'organisation_admin')")
    @ResponseBody
    @Transactional
    public void deleteNews(@PathVariable Long id) {
        Optional<News> news = newsRepository.findById(id);
        news.ifPresent(newsService::deleteNews);
    }

    @RequestMapping(value = "/news", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('user')")
    @Transactional
    public PagedResources<Resource<News>> getNews(
            @RequestParam("lastModifiedDateTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime lastModifiedDateTime,
            @RequestParam("now") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime now,
            Pageable pageable) {
        return wrap(newsRepository.findByPublishedDateNotNullAndLastModifiedDateTimeIsBetweenOrderByLastModifiedDateTimeAscIdAsc(CHSEntity.toDate(lastModifiedDateTime), CHSEntity.toDate(now), pageable));
    }

    @Override
    public Resource<News> process(Resource<News> resource) {
        News news = resource.getContent();
        if (!S.isEmpty(news.getHeroImage())) {
            resource.add(new Link(s3Service.generateMediaDownloadUrl(news.getHeroImage()).toString(), "heroImageSignedURL"));
        }
        return resource;
    }
}
