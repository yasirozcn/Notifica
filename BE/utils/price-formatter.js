const formatPrice = (price) => {
  // Eğer price string ve TL içeriyorsa, TL'yi kaldır
  if (typeof price === "string") {
    price = price.replace(" TL", "");
  }

  // Sayısal değere çevir
  const numericPrice =
    typeof price === "string"
      ? parseFloat(
          price
            .replace(/[^\d,.-]/g, "") // Sadece sayılar, virgül, nokta ve tire kalır
            .replace(/\./g, "") // Binlik ayracı noktaları kaldır
            .replace(",", ".") // Virgülü noktaya çevir
        )
      : price;

  // Sayıyı 100'e böl (son iki sıfırı kaldırmak için)
  const adjustedPrice = numericPrice / 100;

  // Türkçe para birimi formatında formatla (örn: 2.818,99)
  return new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(adjustedPrice);
};

module.exports = formatPrice;
