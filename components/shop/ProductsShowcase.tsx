'use client'
import { useQuery } from '@tanstack/react-query';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCards, Autoplay } from 'swiper/modules';
import Tilt from 'react-parallax-tilt';
import { supabaseClient } from '@/lib/supabase/client';
import { Product } from '@/lib/types/database.types';
import Image from 'next/image';
import Link from 'next/link';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/effect-cards';

// Fetch function for React Query
async function fetchLatestProducts() {
  const { data } = await supabaseClient
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(4);
  return data || [];
}

export function ProductsShowcase() {
  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ['latestProducts'],
    queryFn: fetchLatestProducts,
  });

  return (
    <div className="relative w-full max-w-md mx-auto h-[500px] flex items-center">
      <Swiper
        effect="cards"
        grabCursor={true}
        modules={[EffectCards, Autoplay]}
        autoplay={{
          delay: 2500,
          disableOnInteraction: false,
        }}
        className="w-full [&_.swiper-slide]:rounded-2xl [&_.swiper-slide]:overflow-hidden [&_.swiper-slide]:shadow-xl"
      >
        {products.map((product) => (
          <SwiperSlide key={product.id}>
            <Tilt
              tiltMaxAngleX={15}
              tiltMaxAngleY={15}
              perspective={1000}
              scale={1.05}
              transitionSpeed={1500}
              glareEnable={true}
              glareMaxOpacity={0.3}
              glareColor="#ffffff"
              glarePosition="all"
              glareBorderRadius="12px"
            >
              <Link 
                href={`/products/${product.slug}`}
                className="block relative aspect-[4/5] w-full bg-gradient-to-br from-purple-900/20 to-black/20 group"
              >
                <Image
                  src={product.main_image_url}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6">
                  <h3 className="text-xl font-bold text-white mb-2">{product.name}</h3>
                  <p className="text-purple-300 font-medium">
                    ${product.price.toLocaleString('es-VE')}
                  </p>
                </div>
              </Link>
            </Tilt>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}