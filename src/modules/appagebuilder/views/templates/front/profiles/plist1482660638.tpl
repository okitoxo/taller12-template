{* 
* @Module Name: AP Page Builder
* @Website: apollotheme.com - prestashop template provider
* @author Apollotheme <apollotheme@gmail.com>
* @copyright Apollotheme
* @description: ApPageBuilder is module help you can build content for your shop
*}
<article class="product-miniature js-product-miniature" data-id-product="{$product.id_product}" data-id-product-attribute="{$product.id_product_attribute}" itemscope itemtype="http://schema.org/Product">
  <div class="thumbnail-container">
    <div class="product-image">
<!-- @file modules\appagebuilder\views\templates\front\products\file_tpl -->
{block name='product_thumbnail'}
	{if $product.cover}
    {if isset($formAtts) && isset($formAtts.lazyload) && $formAtts.lazyload}
        

	    {if $lmobile_swipe && $isMobile}
		    <div class="product-list-images-mobile">
		    	<div>
		{/if}
			    	<a href="{$product.url}" class="thumbnail product-thumbnail">
					  <img
						class="img-fluid lazyOwl"
						src = ""
						data-src = "{$product.cover.bySize.home_default.url}"
						alt = "{$product.cover.legend}"
						data-full-size-image-url = "{$product.cover.large.url}"
					  >
					  {if isset($cfg_product_one_img) && $cfg_product_one_img}
						<span class="product-additional" data-idproduct="{if $lmobile_swipe && $isMobile}0{else}{$product.id_product}{/if}"></span>
					  {/if}
					</a>
		{if $lmobile_swipe == 1 && $isMobile}			
				</div>
		    	{foreach from=$product.images item=image}
			    	{if $product.cover.bySize.home_default.url != $image.bySize.home_default.url}
			            <div>
					    	<a href="{$product.url}" class="thumbnail product-thumbnail">
			                    <img
			                      class="img-fluid thumb js-thumb {if $image.id_image == $product.cover.id_image} selected {/if}{if $aplazyload} lazy{/if}"
			                      data-src="{$image.bySize.home_default.url}"
			                      alt="{$image.legend}"
			                      title="{$image.legend}"
			                      itemprop="image"
			                    >
			                </a>
						</div>
					{/if}
				{/foreach}
			<div>
		{/if}
    {else}
    	{if $lmobile_swipe == 1 && $isMobile}
		    <div class="product-list-images-mobile">
		    	<div>
		{/if}
		    	<a href="{$product.url}" class="thumbnail product-thumbnail">
				  <img
					class="img-fluid"
					src = "{$product.cover.bySize.home_default.url}"
					alt = "{$product.cover.legend}"
					data-full-size-image-url = "{$product.cover.large.url}"
				  >
				  {if isset($cfg_product_one_img) && $cfg_product_one_img}
					<span class="product-additional" data-idproduct="{if $lmobile_swipe && $isMobile}0{else}{$product.id_product}{/if}"></span>
				  {/if}
				</a>

		{if $lmobile_swipe == 1 && $isMobile}
				</div>
		    	{foreach from=$product.images item=image}
			    	{if $product.cover.bySize.home_default.url != $image.bySize.home_default.url}
			            <div>
					    	<a href="{$product.url}" class="thumbnail product-thumbnail">
			                    <img
			                      class="thumb js-thumb img-fluid {if $image.id_image == $product.cover.id_image} selected {/if}"
			                      src="{$image.bySize.home_default.url}"
			                      alt="{$image.legend}"
			                      title="{$image.legend}"
			                      itemprop="image"
			                    >
			                </a>
						</div>	
					{/if}
				{/foreach}
			</div>
		{/if}
    {/if}
{else}
  <a href="{$product.url}" class="thumbnail product-thumbnail leo-noimage">
 <img
   {if $aplazyload}class="lazy" data-src{else}src{/if} = "{$urls.no_picture_image.bySize.home_default.url}"
 >
  </a>
{/if}
{/block}

<div class="functional-buttons clearfix">
<!-- @file modules\appagebuilder\views\templates\front\products\file_tpl -->
{hook h='displayLeoWishlistButton' product=$product}

<!-- @file modules\appagebuilder\views\templates\front\products\file_tpl -->
{hook h='displayLeoCompareButton' product=$product}

<!-- @file modules\appagebuilder\views\templates\front\products\file_tpl -->
<div class="quickview{if !$product.main_variants} no-variants{/if} hidden-sm-down">
<a
  href="#"
  class="quick-view btn-product btn"
  data-link-action="quickview"
>
	<span class="leo-quickview-bt-loading cssload-speeding-wheel"></span>
	<span class="leo-quickview-bt-content">
		<i class="icon icon-eye"></i>
	</span>
</a>
</div>
</div>
<!-- @file modules\appagebuilder\views\templates\front\products\file_tpl -->
{if isset($product.attribute) && $product.attribute && isset($product.attribute.Size) && $product.attribute.Size}
{if !isset($leoajax)}
<div class="product-size-attribute">
{/if}
	<ul class="product-attr">
	    {foreach from=$product.attribute.Size item=size}
	        <li class="product-{$size.group_name} {if $size.quantity == 0}Sold-Out{/if}">
	            <a class="{$size.group_name}" title="{$size.name}" href="{$size.url}">{$size.name}</a>
	        </li>
	    {/foreach}
	</ul>
{if !isset($leoajax)}
</div>
{/if}
{else}
<div class="product-item-size product-size-attribute product-size-{$product.id_product}" data-idproduct="{$product.id_product}"></div>
{/if}</div>
    <div class="product-meta">
<!-- @file modules\appagebuilder\views\templates\front\products\file_tpl -->
{block name='product_name'}
  <h3 class="h3 product-title" itemprop="name"><a href="{$product.url}">{$product.name|truncate:30:'...'}</a></h3>
{/block}

<!-- @file modulesappagebuilderviewstemplatesfrontproductsfile_tpl -->
        {block name='product_price_and_shipping'}
          {if $product.show_price}
    <div class="product-price-and-shipping {if $product.has_discount}has_discount{/if}">
              

              {hook h='displayProductPriceBlock' product=$product type="before_price"}

              <span class="price" itemprop="offers" itemscope itemtype="http://schema.org/Offer">
                <span itemprop="priceCurrency" content="{$currency.iso_code}"></span><span itemprop="price" content="{$product.price_amount}">{$product.price}</span>
              </span>
              {if $product.has_discount}
                  {hook h='displayProductPriceBlock' product=$product type="old_price"}

                  <span class="regular-price">{$product.regular_price}</span>
                  {if $product.discount_type === 'percentage'}
                    <span class="discount-percentage">{$product.discount_percentage}</span>
        {elseif $product.discount_type === 'amount'}
          <span class="discount-amount discount-product">{$product.discount_amount_to_display}</span>
                  {/if}
                {/if}
              {hook h='displayProductPriceBlock' product=$product type='unit_price'}

              {hook h='displayProductPriceBlock' product=$product type='weight'}
            </div>
          {/if}
        {/block}

{block name='product_description_short'}
  <div class="product-description-short" itemprop="description">{$product.description_short|strip_tags|truncate:150:'...' nofilter}</div>
{/block}
<!-- @file modules\appagebuilder\views\templates\front\products\file_tpl -->
{hook h='displayLeoCartButton' product=$product}
</div>
  </div>
</article>
