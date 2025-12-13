import { Link } from "react-router";
import { ArticleProps } from "../../pages/ArticlePage/ArticlePage";
import { getImageURLFromArticle } from "../../services/imageService";
import { DEFAULT_IMAGE } from "../../services/imageService";
import Image from "../Image/Image";


/**
 * Component to show Home page Featured articles
 * @param article - Article to be displayed as the featured article
 */
interface FeaturedArticleProps {
    /** Complete article data object */
    article: ArticleProps;
}

function FeaturedArticle({article}: FeaturedArticleProps) {
    return (
        <div>
            <Link to={`/article/${article.key}`} className="group">
                <section className="flex mb-8 border-b-2 border-[#eee] pb-8 gap-[5rem] max-[600px]:block">
                    <div className="text-left">
                        <h2 className="text-(--title-color) text-[28px] group-hover:underline">{ article.title }</h2>
                        {article.shortDescription && <p className="text-(--description-color) text-[16px]">
                            {article.shortDescription}
                        </p>}
                        <div className="inline-flex gap-2 text-(--undertext-color) text-center text-[13px]">
                            <span className="author">By { article.author?.name }</span>
                            <span className="timestamp">
                                { article.timestamp ? new Date(article.timestamp).toLocaleDateString() : null }
                            </span>
                        </div>
                    </div>
                    <Image
                        src={getImageURLFromArticle(article, DEFAULT_IMAGE)}
                        alt={article.title ?? 'Featured Article'}
                        className="w-full max-w-[750px] shrink-0 
                                   group-hover:brightness-110 transition-[filter] 
                                   max-[600px]:w-full"
                        aspectRatio="16/9"
                        placeholder={true}
                        objectFit="cover"
                        loading="eager"
                        fetchPriority="high"
                    />
                </section>
            </Link>
        </div>
    );
};

export default FeaturedArticle;