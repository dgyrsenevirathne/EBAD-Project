"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'

interface TranslationContextType {
  language: string
  setLanguage: (lang: string) => void
  t: (key: string) => string
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined)

const translations = {
  en: {
    // Header
    "nav.shop": "Shop",
    "nav.virtualTryOn": "Virtual Try-On",
    "nav.wishlist": "Wishlist",
    "nav.wholesale": "Wholesale",
    "nav.rewards": "Rewards",
    "nav.about": "About",
    "nav.login": "Login",
    "nav.signUp": "Sign Up",
    "nav.profile": "Profile",

    // Hero Section
    "hero.badge": "Premium Sri Lankan Fashion",
    "hero.title.authentic": "Authentic",
    "hero.title.sriLankan": "Sri Lankan",
    "hero.title.fashion": "Fashion",
    "hero.subtitle": "Discover traditional and modern clothing crafted with love in Sri Lanka. From festive wear to everyday essentials, experience the rich heritage of",
    "hero.brandName": "Ceylon Threads",
    "hero.shopCollection": "Shop Collection",
    "hero.wholesalePortal": "Wholesale Portal",

    // Brand
    "brand.name": "Ceylon Threads",

    // Common
    "common.back": "Back",
    "common.wishlist": "Wishlist",
    "common.profile": "Profile",
    "common.login": "Login",
    "common.viewDetails": "View Details",
    "common.browseAllProducts": "Browse All Products",

    // Stats
    "stats.happyCustomers": "Happy Customers",
    "stats.products": "Products",
    "stats.support": "Support",

    // Features Section
    "features.whyChooseUs": "Why Choose Us",
    "features.experienceDifference": "Experience the",
    "features.difference": "Difference",
    "features.subtitle": "We're not just selling clothes, we're sharing a piece of Sri Lanka's rich cultural heritage",

    // Feature Cards
    "features.virtualTryOn.title": "Virtual Try-On",
    "features.virtualTryOn.description": "Try on clothes virtually before you buy with AI technology",
    "features.loyaltyRewards.title": "Loyalty Rewards",
    "features.loyaltyRewards.description": "Earn points with every purchase. LKR 100 = 1 point",
    "features.wholesalePortal.title": "Wholesale Portal",
    "features.wholesalePortal.description": "Bulk orders with special pricing for retailers",
    "features.fastDelivery.title": "Fast Delivery",
    "features.fastDelivery.description": "Island-wide delivery with Cash on Delivery",

    // Products Section (Home)
    "products.featuredCollection": "Featured Collection",
    "products.trending": "Trending",
    "products.subtitle": "Discover our most loved pieces, handpicked for their quality and style",
    "products.viewDetails": "View Details",
    "products.browseAllProducts": "Browse All Products",
    "products.noProducts": "No featured products available at the moment.",

    // Products Page
    "products.title": "Products",
    "products.back": "Back",
    "products.search": "Search",
    "products.searchPlaceholder": "Search products...",
    "products.category": "Category",
    "products.subcategory": "Subcategory",
    "products.priceRange": "Price Range",
    "products.colors": "Colors",
    "products.spendingLimit": "Spending Limit",
    "products.enterLimit": "Enter limit (LKR)",
    "products.spendingLimitDescription": "Set a maximum amount you want to spend. You'll be alerted when adding items would exceed this limit.",
    "products.currentCartTotal": "Current cart total: LKR",
    "products.filters": "Filters",
    "products.showing": "Showing",
    "products.of": "of",
    "products.count": "products",
    "products.featured": "Featured",
    "products.newest": "Newest",
    "products.priceLowToHigh": "Price: Low to High",
    "products.priceHighToLow": "Price: High to Low",
    "products.highestRated": "Highest Rated",
    "products.variants": "variants",
    "products.onlyLeft": "Only",
    "products.leftInStock": "left in stock",
    "products.outOfStock": "Out of stock",
    "products.addToCart": "Add to Cart",
    "products.notifyMe": "Notify Me",
    "products.noProductsFound": "No products found matching your criteria.",
    "products.clearFilters": "Clear Filters",
    "products.reviews": "reviews",
    "products.review": "review",

    // Filters
    "filters.search": "Search",
    "filters.searchPlaceholder": "Search products...",
    "filters.category": "Category",
    "filters.subcategory": "Subcategory",
    "filters.priceRange": "Price Range",
    "filters.colors": "Colors",
    "filters.spendingLimit": "Spending Limit",
    "filters.spendingLimitPlaceholder": "Enter limit (LKR)",
    "filters.spendingLimitDescription": "Set a maximum amount you want to spend. You'll be alerted when adding items would exceed this limit.",
    "filters.currentCartTotal": "Current cart total: LKR",
    "filters.filters": "Filters",

    // Alerts
    "alerts.addToCartSuccess": "Item added to cart successfully!",
    "alerts.addToCartError": "Failed to add item to cart",
    "alerts.loginRequiredCart": "Please create an account and login first to add items to cart",
    "alerts.addToWishlistSuccess": "Item added to wishlist successfully!",
    "alerts.addToWishlistError": "Failed to add item to wishlist",
    "alerts.loginRequiredWishlist": "Please login to add items to wishlist",
    "alerts.spendingLimitExceeded": "Adding this item would exceed your spending limit. Current cart: LKR {current}, Adding: LKR {adding}, New total: LKR {newTotal}. Your limit is LKR {limit}. Click OK to proceed anyway.",

    // Categories
    "category.all": "All",
    "category.men": "Men",
    "category.women": "Women",
    "category.kids": "Kids",

    // Subcategories
    "subcategory.all": "All",
    "subcategory.sarees": "Sarees",
    "subcategory.shirts": "Shirts",
    "subcategory.dresses": "Dresses",
    "subcategory.traditional": "Traditional",
    "subcategory.blouses": "Blouses",
    "subcategory.wedding": "Wedding",

    // Colors (basic translations)
    "color.red": "Red",
    "color.blue": "Blue",
    "color.gold": "Gold",
    "color.green": "Green",
    "color.brown": "Brown",
    "color.pink": "Pink",
    "color.yellow": "Yellow",
    "color.white": "White",
    "color.cream": "Cream",
    "color.lightBlue": "Light Blue",
    "color.silver": "Silver",

    // Footer
    "footer.authenticFashion": "Authentic Sri Lankan fashion for every occasion",
    "footer.description": "We're passionate about bringing you the finest traditional and modern Sri Lankan clothing, crafted with care and attention to detail. Experience the rich heritage of Ceylon Threads.",
    "footer.contactUs": "Contact Us",
    "footer.findUs": "Find Us",
    "footer.quickLinks": "Quick Links",
    "footer.shopCollection": "Shop Collection",
    "footer.virtualTryOn": "Virtual Try-On",
    "footer.wholesale": "Wholesale",
    "footer.rewardsProgram": "Rewards Program",
    "footer.aboutUs": "About Us",
    "footer.customerService": "Customer Service",
    "footer.secureShopping": "Secure Shopping",
    "footer.fastDelivery": "Fast Delivery",
    "footer.support": "24/7 Support",
    "footer.paymentMethods": "Payment Methods",
    "footer.paymentOptions": "Cash on Delivery, Cards, FriMi, eZ Cash, SampathPay",
    "footer.copyright": "© 2024 Ceylon Threads. All rights reserved.",
    "footer.madeWith": "Made with ❤️ in Sri Lanka"
  },
  si: {
    // Header
    "nav.shop": "සාප්පු",
    "nav.virtualTryOn": "අතථ්‍ය උත්සාහය",
    "nav.wishlist": "ප්‍රියතම",
    "nav.wholesale": "තොග",
    "nav.rewards": "ප්‍රතිලාභ",
    "nav.about": "පිළිබඳව",
    "nav.login": "පිවිසෙන්න",
    "nav.signUp": "ලියාපදිංචි වන්න",
    "nav.profile": "පැතිකඩ",

    // Hero Section
    "hero.badge": "ප්‍රිමියම් ශ්‍රී ලංකා පුරුද්ද",
    "hero.title.authentic": "අභිජනන",
    "hero.title.sriLankan": "ශ්‍රී ලංකා",
    "hero.title.fashion": "පුරුද්ද",
    "hero.subtitle": "ශ්‍රී ලංකාවේ ආදරයෙන් නිර්මාණය කරන ලද සාම්ප්‍රදායික සහ නවීන ඇඳුම් සොයාගන්න. උත්සව ඇඳුම්වල සිට දෛනික අත්‍යවශ්‍ය දේවල් දක්වා,",
    "hero.brandName": "සිලෝන් ත්‍රෙඩ්ස්",
    "hero.shopCollection": "එකතුව සාප්පු කරන්න",
    "hero.wholesalePortal": "තොග ද්වාරය",

    // Brand
    "brand.name": "සිලෝන් ත්‍රෙඩ්ස්",

    // Common
    "common.back": "පසුපසට",
    "common.wishlist": "ප්‍රියතම",
    "common.profile": "පැතිකඩ",
    "common.login": "පිවිසෙන්න",
    "common.viewDetails": "විස්තර බලන්න",
    "common.browseAllProducts": "සියලුම නිෂ්පාදන පිරික්සන්න",

    // Stats
    "stats.happyCustomers": "සතුටු පාරිභෝගිකයන්",
    "stats.products": "නිෂ්පාදන",
    "stats.support": "සහාය",

    // Features Section
    "features.whyChooseUs": "අපව තෝරාගන්නේ ඇයි",
    "features.experienceDifference": "අත්දැකීම",
    "features.difference": "වෙනස",
    "features.subtitle": "අපි රෙදි විකුණන්නේ නැහැ, අපි ශ්‍රී ලංකාවේ පොහොසත් සංස්කෘතික උරුමයේ කොටසක් බෙදාහදා ගන්නවා",

    // Feature Cards
    "features.virtualTryOn.title": "අතථ්‍ය උත්සාහය",
    "features.virtualTryOn.description": "AI තාක්ෂණය සමඟ මිලදී ගැනීමට පෙර අතථ්‍යව රෙදි උත්සාහ කරන්න",
    "features.loyaltyRewards.title": "පක්තිය ප්‍රතිලාභ",
    "features.loyaltyRewards.description": "සෑම මිලදී ගැනීමකදීම ලකුණු උපයන්න. රුපියල් 100 = 1 ලකුණු",
    "features.wholesalePortal.title": "තොග ද්වාරය",
    "features.wholesalePortal.description": "සිල්ලර වෙළෙන්දන් සඳහා විශේෂ මිලකින් තොග ඇණවුම්",
    "features.fastDelivery.title": "ඉක්මන් බෙදාහැරීම",
    "features.fastDelivery.description": "මුදල් ගෙවීමේදී බෙදාහැරීම සමඟ දිවයින පුරා බෙදාහැරීම",

    // Products Section (Home)
    "products.featuredCollection": "විශේෂාංග එකතුව",
    "products.trending": "ජනප්‍රිය",
    "products.subtitle": "ගුණාත්මකභාවය සහ විලාසිතාව සඳහා අපගේ වඩාත්ම ප්‍රිය කරන කොටස් සොයාගන්න",
    "products.viewDetails": "විස්තර බලන්න",
    "products.browseAllProducts": "සියලුම නිෂ්පාදන පිරික්සන්න",
    "products.noProducts": "දැනට විශේෂාංග නිෂ්පාදන නොමැත.",

    // Products Page
    "products.title": "නිෂ්පාදන",
    "products.back": "පසුපසට",
    "products.search": "සෙවීම",
    "products.searchPlaceholder": "නිෂ්පාදන සෙවීම...",
    "products.category": "වර්ගය",
    "products.subcategory": "උපවර්ගය",
    "products.priceRange": "මිල පරාසය",
    "products.colors": "රංග",
    "products.spendingLimit": "වියදම් සීමාව",
    "products.enterLimit": "සීමාව ඇතුළත් කරන්න (රු.)",
    "products.spendingLimitDescription": "ඔබ වියදම් කිරීමට අපේක්ෂා කරන උපරිම මුදලක් සකසන්න. අයිතම එකතු කිරීම මෙම සීමාව ඉක්මවා යාමේදී ඔබට දැනුම් දෙනු ලැබේ.",
    "products.currentCartTotal": "වර්තමාන කාච්චරිය මුළු: රු.",
    "products.filters": "පෙරහන්",
    "products.showing": "පෙන්වමින්",
    "products.of": "හි",
    "products.count": "නිෂ්පාදන",
    "products.featured": "විශේෂාංග",
    "products.newest": "නවමු",
    "products.priceLowToHigh": "මිල: අඩු සිට ඉහළට",
    "products.priceHighToLow": "මිල: ඉහළ සිට අඩුට",
    "products.highestRated": "ඉහළම ශ්‍රේණිගත",
    "products.variants": "විකල්ප",
    "products.onlyLeft": "මිස පමණක්",
    "products.leftInStock": "ස්ටොක්වල ඉතිරිව",
    "products.outOfStock": "ස්ටොක් නැත",
    "products.addToCart": "කාච්චරියට එකතු කරන්න",
    "products.notifyMe": "දන්වන්න",
    "products.noProductsFound": "ඔබගේ ක්‍රයිටීරියා සමඟ ගැලපෙන නිෂ්පාදන සොයාගත නොහැක.",
    "products.clearFilters": "පෙරහන් හිස් කරන්න",
    "products.reviews": "විමර්ශන",
    "products.review": "විමර්ශනය",

    // Filters
    "filters.search": "සෙවීම",
    "filters.searchPlaceholder": "නිෂ්පාදන සෙවීම...",
    "filters.category": "වර්ගය",
    "filters.subcategory": "උපවර්ගය",
    "filters.priceRange": "මිල පරාසය",
    "filters.colors": "රංග",
    "filters.spendingLimit": "වියදම් සීමාව",
    "filters.spendingLimitPlaceholder": "සීමාව ඇතුළත් කරන්න (රු.)",
    "filters.spendingLimitDescription": "ඔබ වියදම් කිරීමට අපේක්ෂා කරන උපරිම මුදලක් සකසන්න. අයිතම එකතු කිරීම මෙම සීමාව ඉක්මවා යාමේදී ඔබට දැනුම් දෙනු ලැබේ.",
    "filters.currentCartTotal": "වර්තමාන කාච්චරිය මුළු: රු.",
    "filters.filters": "පෙරහන්",

    // Alerts
    "alerts.addToCartSuccess": "අයිතමය සාර්ථකව කාච්චරියට එකතු කරන ලදි!",
    "alerts.addToCartError": "අයිතමය කාච්චරියට එකතු කිරීම අසාර්ථක විය",
    "alerts.loginRequiredCart": "කාච්චරියට අයිතම එකතු කිරීමට පළමුව ගිණුමක් සාදා පිවිසෙන්න",
    "alerts.addToWishlistSuccess": "අයිතමය සාර්ථකව ප්‍රියතම ලැයිස්තුවට එකතු කරන ලදි!",
    "alerts.addToWishlistError": "අයිතමය ප්‍රියතම ලැයිස්තුවට එකතු කිරීම අසාර්ථක විය",
    "alerts.loginRequiredWishlist": "ප්‍රියතම ලැයිස්තුවට අයිතම එකතු කිරීමට පිවිසෙන්න",
    "alerts.spendingLimitExceeded": "මෙම අයිතමය එකතු කිරීමෙන් ඔබගේ වියදම් සීමාව ඉක්මවා යයි. වර්තමාන කාච්චරිය: රු. {current}, එකතු කිරීම: රු. {adding}, නව මුළු: රු. {newTotal}. ඔබගේ සීමාව: රු. {limit}. කෙසේ වුවත් ඉදිරියට යාමට OK ක්ලික් කරන්න.",

    // Categories
    "category.all": "සියල්ල",
    "category.men": "පිරිමි",
    "category.women": "ස්ත්‍රීන්",
    "category.kids": "ළමුන්",

    // Subcategories
    "subcategory.all": "සියල්ල",
    "subcategory.sarees": "සාරි",
    "subcategory.shirts": "බොත්තම්",
    "subcategory.dresses": "ඇඳුම්",
    "subcategory.traditional": "සම්ප්‍රදායික",
    "subcategory.blouses": "බ්ලෞස්",
    "subcategory.wedding": "විවාහය",

    // Colors
    "color.red": "රතු",
    "color.blue": "නිල්",
    "color.gold": "සෝනා",
    "color.green": "කොළ",
    "color.brown": "බවුන්",
    "color.pink": "ගුල්පිත්ත",
    "color.yellow": "කහ",
    "color.white": "සුදු",
    "color.cream": "ක්‍රීම්",
    "color.lightBlue": "ආලෝක නිල්",
    "color.silver": "රිදී",

    // Footer
    "footer.authenticFashion": "සෑම අවස්ථාවකම සඳහා අභිජනන ශ්‍රී ලංකා පුරුද්ද",
    "footer.description": "අපි ඔබට හොඳම සාම්ප්‍රදායික සහ නවීන ශ්‍රී ලංකා ඇඳුම් ගෙන ඒමට උනන්දු වෙනවා, සැලකිල්ලෙන් සහ අවධානයෙන් නිර්මාණය කරන ලද. සිලෝන් ත්‍රෙඩ්ස් හි පොහොසත් උරුමය අත්විඳින්න.",
    "footer.contactUs": "අප අමතන්න",
    "footer.findUs": "අප සොයන්න",
    "footer.quickLinks": "ඉක්මන් සබැඳි",
    "footer.shopCollection": "එකතුව සාප්පු කරන්න",
    "footer.virtualTryOn": "අතථ්‍ය උත්සාහය",
    "footer.wholesale": "තොග",
    "footer.rewardsProgram": "ප්‍රතිලාභ වැඩසටහන",
    "footer.aboutUs": "අප පිළිබඳව",
    "footer.customerService": "පාරිභෝගික සේවය",
    "footer.secureShopping": "ආරක්ෂිත සාප්පු කිරීම",
    "footer.fastDelivery": "ඉක්මන් බෙදාහැරීම",
    "footer.support": "24/7 සහාය",
    "footer.paymentMethods": "ගෙවීම් ක්‍රම",
    "footer.paymentOptions": "මුදල් ගෙවීමේදී බෙදාහැරීම, කාඩ්පත්, FriMi, eZ Cash, SampathPay",
    "footer.copyright": "© 2024 සිලෝන් ත්‍රෙඩ්ස්. සියලුම හිමිකම් රඳවා ගන්නා ලදි.",
    "footer.madeWith": "ශ්‍රී ලංකාවේ ❤️ සමඟ නිර්මාණය කරන ලදි"
  }
}

export function TranslationProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState('en')

  useEffect(() => {
    // Get saved language from localStorage or default to English
    const savedLanguage = localStorage.getItem('language') || 'en'
    setLanguage(savedLanguage)
    document.documentElement.lang = savedLanguage
  }, [])

  const t = (key: string): string => {
    const languageTranslations = translations[language as keyof typeof translations]
    if (!languageTranslations) return key

    const translation = (languageTranslations as any)[key]
    return translation || key
  }

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage)
    localStorage.setItem('language', newLanguage)
    document.documentElement.lang = newLanguage
  }

  return (
    <TranslationContext.Provider value={{ language, setLanguage: handleLanguageChange, t }}>
      {children}
    </TranslationContext.Provider>
  )
}

export function useTranslation() {
  const context = useContext(TranslationContext)
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider')
  }
  return context
}
