class Product {
    constructor({ id, name, description, price, photo, category, origin_address }) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.price = price;
        this.photo = photo;
        this.category = category;
        this.origin_address = origin_address;
    }
}

class Review {
    constructor({ id, comment, date, order, stars }) {
        this.id = id;
        this.comment = comment;
        this.date = date;
        this.order = order;
        this.stars = stars;
    }
}

const path = "https://heros-shop-i-default-rtdb.firebaseio.com/";

const productDiv = document.querySelector(".product");
const productRating = document.querySelector(".product-rating");
const comments = document.querySelector(".comments");
const commentsTitle = document.querySelector(".comments-title");
const commentsSubtitle = document.querySelector(".comments-subtitle");

document.addEventListener("DOMContentLoaded", lastPageMethod);
document.addEventListener("DOMContentLoaded", getCurrentProduct);
document.addEventListener("DOMContentLoaded", fetchReviews);

function lastPageMethod() {
    localStorage.setItem("lastPage", "04_ReviewPage/index.html");
}

function getCurrentProduct() {
    fetchProduct()
        .then((product) => {
            loadProductInformation(product);
        })
        .catch((error) => {
            console.error("An error occured trying to load products list: ", error);
        });
}

function fetchProduct() {
    return fetch(`${path}product.json`)
        .then((response) => {
            if (!response.ok) {
                throw new Error("Network answer was not ok.");
            }
            return response.json();
        })
        .then((products) => {
            return new Product({
                id: localStorage.getItem("currentProduct"),
                name: products[localStorage.getItem("currentProduct")].name,
                description: products[localStorage.getItem("currentProduct")].description,
                price: products[localStorage.getItem("currentProduct")].price,
                photo: products[localStorage.getItem("currentProduct")].photo,
                category: products[localStorage.getItem("currentProduct")].category,
                origin_address: products[localStorage.getItem("currentProduct")].origin_address,
            });
        });
}

function loadProductInformation(product) {
    productDiv.id = `${product.id}`;

    const image = document.createElement("div");
    image.className = "product-image";
    const photo = document.createElement("img");
    photo.src = `${product.photo}`;
    photo.className = "product-photo";
    image.appendChild(photo);

    const name = document.createElement("h3");
    name.innerHTML = `${product.name}`;

    const description = document.createElement("p");
    description.className = `description`;
    description.innerHTML = `${product.description}`;

    const price = document.createElement("p");
    price.className = `price`;
    price.innerHTML = `${product.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`;

    productDiv.appendChild(image);
    productDiv.appendChild(name);
    productDiv.appendChild(description);
    productDiv.appendChild(price);
}

function fetchReviews() {
    let reviewStats = { quantityOfReviews: 0.0, starsSum: 0.0 };
    let promises = [];

    fetch(`${path}review.json`)
        .then((response) => {
            if (!response.ok) {
                throw new Error("Network answer was not ok.");
            }
            return response.json();
        })
        .then((reviews) => {
            for (let key in reviews) {
                promises.push(
                    addReviewToCommentsSection(
                        reviewStats,
                        new Review({
                            id: key,
                            comment: reviews[key].comment,
                            date: reviews[key].date,
                            order: reviews[key].order,
                            stars: reviews[key].stars,
                        }),
                        reviews[key].order
                    )
                );
            }

            return Promise.all(promises);
        })
        .then(() => {
            let starsAverage = reviewStats.starsSum / reviewStats.quantityOfReviews;

            for (let i = 0; i < Math.floor(starsAverage); i++) {
                let star = document.createElement("img");
                star.className = "stars-image";
                star.src = "assets/images/star_filled.png";
                productRating.appendChild(star);
            }

            if (reviewStats.starsSum && reviewStats.quantityOfReviews && Math.floor(starsAverage) != Math.ceil(starsAverage)) {
                let star = document.createElement("img");
                star.className = "stars-image";
                star.src = "assets/images/star_half.png";
                productRating.appendChild(star);
            }

            for (let i = 0; i < 5 - Math.ceil(starsAverage); i++) {
                let star = document.createElement("img");
                star.className = "stars-image";
                star.src = "assets/images/star_unfilled.png";
                productRating.appendChild(star);
            }

            if (reviewStats.quantityOfReviews == 0) {
                commentsTitle.innerHTML = `Não há avaliações para este produto.`;
            } else if (reviewStats.quantityOfReviews == 1) {
                commentsTitle.innerHTML = `Há ${reviewStats.quantityOfReviews} avaliação para este produto.`;
            } else {
                commentsTitle.innerHTML = `Há ${reviewStats.quantityOfReviews} avaliações para este produto.`;
            }

            if (reviewStats.quantityOfReviews >= 1) {
                const ratingStar = document.createElement("p");
                ratingStar.className = "rating-star";
                ratingStar.innerHTML = `${starsAverage.toFixed(1)}`;
                productRating.appendChild(ratingStar);
            }

            if (reviewStats.quantityOfReviews >= 4) {
                commentsSubtitle.innerHTML = `Avaliações em destaque:`;
            }
        });
}

function addReviewToCommentsSection(reviewStats, review, orderKey) {
    return fetch(`${path}order.json`)
        .then((response) => {
            if (!response.ok) {
                throw new Error("Network answer was not ok.");
            }
            return response.json();
        })
        .then((orders) => {
            if (orders[orderKey].product == localStorage.getItem("currentProduct")) {
                reviewStats.quantityOfReviews++;
                reviewStats.starsSum += review.stars;

                const commentDiv = document.createElement("div");
                commentDiv.className = "comment";

                const userPhoto = document.createElement("img");

                const commentContent = document.createElement("div");
                commentContent.className = "comment-content";

                const username = document.createElement("h4");

                addUserInformationToReview(orders[orderKey].user, userPhoto, username);

                const rating = document.createElement("div");
                rating.className = "rating";

                for (let i = 0; i < review.stars; i++) {
                    let star = document.createElement("img");

                    star.src = "assets/images/star_filled.png";

                    rating.appendChild(star);
                }

                for (let i = 0; i < 5 - review.stars; i++) {
                    let star = document.createElement("img");

                    star.src = "assets/images/star_unfilled.png";

                    rating.appendChild(star);
                }

                const commentText = document.createElement("p");
                commentText.innerHTML = review.comment;

                commentContent.appendChild(username);
                commentContent.appendChild(rating);
                commentContent.appendChild(commentText);
                commentDiv.appendChild(userPhoto);
                commentDiv.appendChild(commentContent);

                if (reviewStats.quantityOfReviews <= 3) {
                    comments.appendChild(commentDiv);
                }
            }
        });
}

function addUserInformationToReview(userKey, userPhoto, username) {
    return fetch(`${path}user.json`)
        .then((response) => {
            if (!response.ok) {
                throw new Error("Network answer was not ok.");
            }
            return response.json();
        })
        .then((users) => {
            if (users[userKey].photo) {
                userPhoto.src = users[userKey].photo;
            } else {
                userPhoto.src = "https://placehold.jp/12/ff2d00/ffffff/75x75.png?text=no+photo";
            }

            username.innerHTML = users[userKey].name;
        });
}
