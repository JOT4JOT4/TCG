"""Database seeder for One Piece TCG cards."""
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.models.card import Card, CardType

DEFAULT_CARDS = [
    {"name": "Bartholomew Kuma", "card_type": CardType.PARAMECIA, "power": 8, "description": "Antiguo Shichibukai. Con la fruta Nikyu Nikyu repele materia, dolor y ataques a la velocidad del aire.", "image_url": "/cards/__bartholomew_kuma_one_piece_and_1_more_drawn_by_ryuda__0f72a2f93ccd130e74c81032031f4d66.jpg"},
    {"name": "Boa Hancock & Salome", "card_type": CardType.PARAMECIA, "power": 8, "description": "Emperatriz Pirata de Amazon Lily. La fruta Mero Mero petrifica de inmediato a quienes sucumben a su encanto.", "image_url": "/cards/__boa_hancock_and_salome_one_piece_and_1_more_drawn_by_otton__6a0643063cd701ac59c0d2b66d5588fb.jpg"},
    {"name": "Boa Sandersonia", "card_type": CardType.ZOAN, "power": 6, "description": "Hermana Gorgona de Amazon Lily. Transforma su cuerpo en una anaconda colosal de fuerza constrictora.", "image_url": "/cards/__boa_sandersonia_one_piece_and_1_more_drawn_by_sakiko_oxab_b__b743c1cbbd0e26d316615aaac555984b.jpg"},
    {"name": "Magellan & Bon Clay", "card_type": CardType.LOGIA, "power": 8, "description": "El veneno letal de la fruta Doku Doku del alcaide y la inquebrantable amistad okama de Bon Clay.", "image_url": "/cards/__bon_clay_and_magellan_one_piece_and_1_more_drawn_by_moreshan__89e94ce2a5894f954c4045ee600eced9.jpg"},
    {"name": "Brook Rey del Soul", "card_type": CardType.PARAMECIA, "power": 6, "description": "Músico de los Sombrero de Paja. Con la fruta Yomi Yomi canaliza el frío del más allá en su espada esgrima.", "image_url": "/cards/__brook_one_piece_and_1_more_drawn_by_teo_telo_ruka__1f6273d357b42934fbf4cb72176a7e0a.jpg"},
    {"name": "Buggy el Payaso Estrella", "card_type": CardType.PARAMECIA, "power": 5, "description": "Emperador del mar. La fruta Bara Bara le otorga inmunidad absoluta a cualquier corte separando su cuerpo.", "image_url": "/cards/__buggy_the_clown_one_piece_and_1_more_drawn_by_dai_xt__sample-a8f55e35656b4248ac69c1b08a1f38a7.jpg"},
    {"name": "Calgara Gran Demonio", "card_type": CardType.ZOAN, "power": 7, "description": "Legendario gran guerrero de Shandora. Protegió la campana dorada con ferocidad y bravura ancestral.", "image_url": "/cards/__calgara_one_piece_and_1_more_drawn_by_moreshan__d56d59558e6dcdb251086fe57bbc5a74.jpg"},
    {"name": "Capitán Kuro", "card_type": CardType.ZOAN, "power": 4, "description": "Líder del Clan Gato Negro. Se desplaza a velocidad invisible con su paso sigiloso y diez garras de acero.", "image_url": "/cards/__captain_kuro_one_piece_and_1_more_drawn_by_ryuda__36556d1750ba84d72c8571851958e68b.jpg"},
    {"name": "Carrot Sulong", "card_type": CardType.ZOAN, "power": 7, "description": "Guerrera de la tribu Mink. Bajo la luz de la luna llena desata el poder feral y electrificado del Sulong.", "image_url": "/cards/__carrot_one_piece_and_1_more_drawn_by_kicori__658bf6df702b98cd45f5d4f5c144ffbc.jpg"},
    {"name": "Cavendish & Hakuba", "card_type": CardType.ZOAN, "power": 7, "description": "Príncipe hermoso de Rommel cuyo alter ego oscuro, Hakuba, corta como una tormenta demoníaca incontrolable.", "image_url": "/cards/__cavendish_one_piece_and_1_more_drawn_by_rokushiro_koushi__16333583043f530f0fbd4d14e2b593ee.jpg"},
    {"name": "Charlotte Cracker", "card_type": CardType.PARAMECIA, "power": 7, "description": "Comandante Dulce de Big Mom. Con la fruta Bisu Bisu crea armaduras y guerreros de galleta casi impenetrables.", "image_url": "/cards/__charlotte_cracker_one_piece_and_1_more_drawn_by_bisaiiiii__c0a712822af138f452ed40af4bc200a6.jpg"},
    {"name": "Charlotte Katakuri", "card_type": CardType.LOGIA, "power": 9, "description": "El invicto de la familia Charlotte. Su dominio de la fruta Mochi Mochi y visión del futuro desafían a cualquier rival.", "image_url": "/cards/__charlotte_katakuri_one_piece_and_1_more_drawn_by_rokushiro_koushi__f06c67e75efbc35e99e3d554d513cbc7.jpg"},
    {"name": "Big Mom & Prometheus", "card_type": CardType.LOGIA, "power": 9, "description": "Emperatriz del Mar con la fruta Soru Soru. Arrebata almas humanas y comanda soles vivientes como Prometheus.", "image_url": "/cards/__charlotte_linlin_and_prometheus_one_piece_and_1_more_drawn_by_kicori__bf012b4e6b14fb520d25d253da4d898c.jpg"},
    {"name": "Charlotte Perospero", "card_type": CardType.PARAMECIA, "power": 6, "description": "Hijo mayor de Big Mom. Con la fruta Pero Pero manipula y endurece caramelo hirviente para atrapar enemigos.", "image_url": "/cards/__charlotte_perospero_one_piece_and_1_more_drawn_by_nekobayashi__d97cfa8070cff1bbf6978203b064136b.jpg"},
    {"name": "Charlotte Pudding", "card_type": CardType.PARAMECIA, "power": 5, "description": "Tribu de los tres ojos. Con la fruta Memo Memo extrae, modifica y reescribe memorias como cintas de cine.", "image_url": "/cards/__charlotte_pudding_one_piece_and_1_more_drawn_by_rokushiro_koushi__25846e8e6225f2501d280b93d348b060.jpg"},
    {"name": "Crocodile Rey del Desierto", "card_type": CardType.LOGIA, "power": 8, "description": "Antiguo líder de Baroque Works. La fruta Suna Suna le otorga cuerpo de arena y deseca cualquier sustancia vital.", "image_url": "/cards/__crocodile_one_piece_and_1_more_drawn_by_bisaiiiii__2ae6e29884191ab2d8b54062686982f0.jpg"},
    {"name": "Donquixote Rosinante (Corazón)", "card_type": CardType.PARAMECIA, "power": 5, "description": "Comandante de la Marina encubierto. Con la fruta Nagi Nagi apaga absolutamente todo sonido en su entorno.", "image_url": "/cards/__donquixote_rocinante_one_piece_and_1_more_drawn_by_bisaiiiii__e3175cc0d26c6c9846390b1f458b8fe9.jpg"},
    {"name": "Don Krieg & Armada del Este", "card_type": CardType.PARAMECIA, "power": 4, "description": "El gobernante del East Blue con su armadura de acero dorado, lanzallamas, escudos y gas venenoso MH5.", "image_url": "/cards/__don_krieg_gin_and_pearl_one_piece_and_1_more_drawn_by_tatsuya_atelier_road__5dcc72cb5d408ad8adaddb5fac32fdf6.jpg"},
    {"name": "Dracule Mihawk Ojos de Halcón", "card_type": CardType.LOGIA, "power": 9, "description": "El espadachín más fuerte del mundo. Parte galeones y icebergs gigantescos con la legendaria hoja negra Yoru.", "image_url": "/cards/__dracule_mihawk_one_piece_and_1_more_drawn_by_egawa_akira__dfbf1423e8b44e9d4cf1c4d8a39538c7.jpg"},
    {"name": "Edward Newgate (Barbablanca)", "card_type": CardType.LOGIA, "power": 9, "description": "El hombre más fuerte del mundo. Con la fruta Gura Gura fractura el aire desatando tsunamis y terremotos.", "image_url": "/cards/__edward_newgate_one_piece_and_1_more_drawn_by_adachi_yousuke__d472e88d9979bccfddb6597c64f47c31.jpg"},
    {"name": "Emporio Ivankov", "card_type": CardType.PARAMECIA, "power": 7, "description": "Líder okama del Ejército Revolucionario. Con la fruta Horu Horu remodela el metabolismo y energía biológica.", "image_url": "/cards/__emporio_ivankov_one_piece_and_1_more_drawn_by_sunohara_encount__sample-999d89517788f046d13de36a815ccb70.jpg"},
    {"name": "Dios Enel", "card_type": CardType.LOGIA, "power": 8, "description": "Tirano de Skypiea. Con la fruta Goro Goro se transforma en relámpago puro desatando hasta 200 millones de voltios.", "image_url": "/cards/__enel_one_piece_and_1_more_drawn_by_yasu8hasu__acc65c8100e6d306324c5314536fc5e5.jpg"},
    {"name": "Eustass Captain Kid", "card_type": CardType.LOGIA, "power": 8, "description": "Capitán de la Peor Generación. Con la fruta Jiki Jiki manipula el magnetismo forjando descomunales brazos de metal.", "image_url": "/cards/__eustass_kid_one_piece_and_1_more_drawn_by_bashikou__3b678417d15d620e4cf52266350adb71.jpg"},
    {"name": "Franky el Cyborg de Hierro", "card_type": CardType.PARAMECIA, "power": 6, "description": "Carpintero de los Sombrero de Paja impulsado por cola. Dispara el colosal rayo Radical Beam desde sus palmas.", "image_url": "/cards/__franky_one_piece_and_1_more_drawn_by_shinra0609__b5595422ee619895f0df2ef7dcc69d61.jpg"},
    {"name": "Gol D. Roger Rey Pirata", "card_type": CardType.LOGIA, "power": 9, "description": "El Rey de los Piratas. Conquistó la Gran Línea sólo con su inmenso Haki y desató la Gran Era de la Piratería.", "image_url": "/cards/__gol_d_roger_one_piece_and_1_more_drawn_by_tatsuya_atelier_road__5b4b5c4920142474e21a529e5999ed2a.jpg"},
    {"name": "Jewelry Bonney", "card_type": CardType.PARAMECIA, "power": 6, "description": "Capitana de la Peor Generación. Con la fruta Toshi Toshi altera la edad y la línea temporal de quien toque.", "image_url": "/cards/__jewelry_bonney_one_piece_and_1_more_drawn_by_bisaiiiii__d29b5deaf7c7d37d1a4149bd8b2547fc.jpg"},
    {"name": "Jinbe Caballero del Mar", "card_type": CardType.ZOAN, "power": 8, "description": "Timonel de los Sombrero de Paja. Gran maestro del Karate Gyojin que propaga impactos a través del vapor de agua.", "image_url": "/cards/__jinbe_one_piece_and_1_more_drawn_by_moopic__abe9ad38ac22956bd9c47b22960637c0.jpg"},
    {"name": "Kaidou de las Bestias", "card_type": CardType.ZOAN, "power": 9, "description": "Gobernador de los Piratas de las Bestias. Con la fruta Uo Uo se transforma en un dragón azul que arrasa con fuego.", "image_url": "/cards/__kaidou_one_piece_and_1_more_drawn_by_dai_xt__sample-6c1d5f67be12049365160d3ba2a73330.jpg"},
    {"name": "Kikunojo de la Nieve Caída", "card_type": CardType.ZOAN, "power": 6, "description": "Feroz espadachina de los Nueve Vainas Rojas. Su esgrima helada corta con la precisión de la primera nevada.", "image_url": "/cards/__kikunojo_and_urashima_one_piece_and_1_more_drawn_by_sunohara_encount__sample-8c906a5d9c04d3cc9ded4e21c81c3795.jpg"},
    {"name": "Kizaru Borsalino", "card_type": CardType.LOGIA, "power": 9, "description": "Almirante de la Marina. Con la fruta Pika Pika se convierte en fotones de luz, pateando a velocidad cegadora.", "image_url": "/cards/__kizaru_one_piece_and_1_more_drawn_by_bisaiiiii__a565709a08f9b2514f3a7f4924a82e80.jpg"},
    {"name": "Koala Revolucionaria", "card_type": CardType.PARAMECIA, "power": 5, "description": "Oficial del Ejército Revolucionario e instructora de artes marciales Gyojin junto a Sabo.", "image_url": "/cards/__koala_one_piece_and_1_more_drawn_by_bisaiiiii__1754a5467e50ed408049fcedd8f34d8c.jpg"},
    {"name": "Garp & Koby Héroes de la Marina", "card_type": CardType.ZOAN, "power": 9, "description": "El legendario Héroe de la Marina y su pupilo prodigio destrozando fortalezas con el impacto Galaxy Impact.", "image_url": "/cards/__koby_and_monkey_d_garp_one_piece_and_1_more_drawn_by_rokushiro_koushi__23e4b47c5468483a15c022674b14b4a4.jpg"},
    {"name": "Marshall D. Teach (Barbanegra)", "card_type": CardType.LOGIA, "power": 9, "description": "Capitán de los Piratas de Barbanegra. Con la fruta Yami Yami absorbe y anula cualquier poder de fruta del diablo.", "image_url": "/cards/__marshall_d_teach_one_piece_and_1_more_drawn_by_nagare_seiya__9f671a729961c5e8200433fecceb5758.jpg"},
    {"name": "Luffy Nika vs Kaidou Dragón", "card_type": CardType.ZOAN, "power": 9, "description": "El despertar del Dios del Sol Nika desafiando a la criatura más fuerte en el tejado de Onigashima.", "image_url": "/cards/__monkey_d_luffy_and_kaidou_one_piece_and_1_more_drawn_by_tatsuya_atelier_road__3690bc20d6baf0c3800167f084b9c08b.jpg"},
    {"name": "Luffy & Ace Hermanos del Mar", "card_type": CardType.LOGIA, "power": 8, "description": "El lazo de fuego y hermandad de Luffy y Ace combatiendo juntos con llamas inextinguibles.", "image_url": "/cards/__monkey_d_luffy_and_portgas_d_ace_one_piece_and_1_more_drawn_by_hokuyuu__fb82407a1d7e453c3cd637f7063f9a77.jpg"},
    {"name": "Monkey D. Luffy Gear 4", "card_type": CardType.ZOAN, "power": 8, "description": "Boundman. Infla sus músculos con aire y Haki de armamento convirtiéndose en una imparable bola elástica.", "image_url": "/cards/__monkey_d_luffy_one_piece_and_1_more_drawn_by_bashikou__61e15637d7902defc36ef26d10f58d20.jpg"},
    {"name": "Monkey D. Luffy Sombrero de Paja", "card_type": CardType.PARAMECIA, "power": 7, "description": "Capitán de los Sombrero de Paja con cuerpo de goma que desafía cualquier peligro con su sonrisa imborrable.", "image_url": "/cards/__monkey_d_luffy_one_piece_and_1_more_drawn_by_rokushiro_koushi__5f261e43b802c015baad257bf03194be.jpg"},
    {"name": "Alianza de Wano (Luffy, Yamato & Momonosuke)", "card_type": CardType.ZOAN, "power": 9, "description": "El Dios del Sol, el lobo sagrado Okuchi no Makami y el dragón rosado unidos por la liberación de Wano.", "image_url": "/cards/__monkey_d_luffy_yamato_and_kouzuki_momonosuke_one_piece_and_1_more_drawn_by_sunohara_encount__sample-0db61a87b1d894ad92e97ed1065cf627.jpg"},
    {"name": "Nami & Zeus Rayo Climático", "card_type": CardType.LOGIA, "power": 6, "description": "La navegante armada con el alma tormentosa de Zeus fulmina ejércitos enteros con relámpagos devastadores.", "image_url": "/cards/__nami_and_zeus_one_piece_and_1_more_drawn_by_sunohara_encount__sample-12660449c6c5c32f3c28efd7a2250205.jpg"},
    {"name": "Nami la Gata Ladrona", "card_type": CardType.LOGIA, "power": 5, "description": "Navegante prodigiosa que domina el clima con su Clima-Tact, creando espejismos, viento y lluvia.", "image_url": "/cards/__nami_one_piece_and_1_more_drawn_by_nanahara_shie__01963bf31bd5f38e04b742646f2e36bb.jpg"},
    {"name": "Nefertari Vivi & Karoo", "card_type": CardType.ZOAN, "power": 4, "description": "Princesa de Alabasta montada en su veloz pato Karoo, portando la determinación de defender a su pueblo.", "image_url": "/cards/__nefertari_vivi_one_piece_and_1_more_drawn_by_sunohara_encount__sample-17e1f8136be7e3e785342c391b374038.jpg"},
    {"name": "Nico Robin Demonio Fleur", "card_type": CardType.PARAMECIA, "power": 8, "description": "La niña demonio despierta su forma titánica alada floreciendo gigantescos brazos oscuros de castigo.", "image_url": "/cards/__nico_robin_and_demonio_fleur_one_piece_and_1_more_drawn_by_otton__fe8373acb673b56094a016676415bfb8.jpg"},
    {"name": "Nico Robin Niña Demonio", "card_type": CardType.PARAMECIA, "power": 7, "description": "Arqueóloga con la fruta Hana Hana. Hace florecer sus extremidades en cualquier superficie que sus ojos vean.", "image_url": "/cards/__nico_robin_one_piece_and_1_more_drawn_by_sunohara_encount__sample-ec57707ea17cc1a7366a7b52a46cdcfb.jpg"},
    {"name": "Perona Princesa Fantasma", "card_type": CardType.LOGIA, "power": 5, "description": "Comandante de Thriller Bark. Con la fruta Horo Horo crea espectros que quitan toda voluntad de lucha.", "image_url": "/cards/__perona_one_piece_and_1_more_drawn_by_shinra0609__b73b5de8f123a6d52cf0daca36c479ee.jpg"},
    {"name": "Portgas D. Ace Puño de Fuego", "card_type": CardType.LOGIA, "power": 8, "description": "Comandante de la 2da división de Barbablanca. La fruta Mera Mera convierte su cuerpo en fuego inextinguible.", "image_url": "/cards/__portgas_d_ace_one_piece_and_1_more_drawn_by_namahamu913__sample-c148f374fa3ba590974fd3037ccce9a1.jpg"},
    {"name": "Rob Lucci Leopardo CP0", "card_type": CardType.ZOAN, "power": 8, "description": "Asesino supremo del Gobierno. La fruta Neko Neko modelo Leopardo potencia sus técnicas de muerte Rokushiki.", "image_url": "/cards/__rob_lucci_and_hattori_one_piece_and_1_more_drawn_by_moreshan__0ef7324a3a18fe07448d39706533a93a.jpg"},
    {"name": "Roronoa Zoro Santoryu", "card_type": CardType.ZOAN, "power": 8, "description": "Espadachín que empuña tres katanas al unísono con el espíritu y ferocidad de una bestia indómita.", "image_url": "/cards/__roronoa_zoro_one_piece_and_1_more_drawn_by_bisaiiiii__805832862b378fd6a3db70ddfc13c78c.jpg"},
    {"name": "Roronoa Zoro Rey del Infierno", "card_type": CardType.ZOAN, "power": 9, "description": "Desata el Haki del Conquistador a través de Enma, declarándose a sí mismo como el Rey del Infierno.", "image_url": "/cards/__roronoa_zoro_one_piece_and_1_more_drawn_by_nagare_seiya__50cf43c692f3759d930a194f976d8d46.jpg"},
    {"name": "Roronoa Zoro Torbellino del Dragón", "card_type": CardType.ZOAN, "power": 7, "description": "Un vendaval de cortes giratorios que eleva a sus rivales por los cielos rompiendo defensas de hierro.", "image_url": "/cards/__roronoa_zoro_one_piece_and_1_more_drawn_by_rokushiro_koushi__d7f3c414095df6f8c887f67928c62dea.jpg"},
    {"name": "Sabo Emperador de las Llamas", "card_type": CardType.LOGIA, "power": 9, "description": "Número dos del Ejército Revolucionario. Heredero de la fruta Mera Mera y maestro del arte marcial Ryusoken.", "image_url": "/cards/__sabo_one_piece_and_1_more_drawn_by_bashikou__387aa06eb43011559c581d70c0aabe3e.jpg"},
    {"name": "Sanji Cazador de Reyes Marinos", "card_type": CardType.ZOAN, "power": 7, "description": "El cocinero de los Sombrero de Paja derriba con una sola patada colosal a las bestias gigantes de Alabasta.", "image_url": "/cards/__sanji_and_bananawani_one_piece_and_1_more_drawn_by_matsumoto_akira__932a3f1e8b969e5d2852051d226281e8.png"},
    {"name": "Sanji Diable Jambe", "card_type": CardType.LOGIA, "power": 8, "description": "Su pierna arde al rojo vivo mediante fricción extrema, calcinando al adversario con cada impacto fulgurante.", "image_url": "/cards/__sanji_one_piece_and_1_more_drawn_by_nijimaarc__7dbcd238e42091f37c91485b72ec5169.jpg"},
    {"name": "Sanji Pierna Negra", "card_type": CardType.PARAMECIA, "power": 7, "description": "Caballero veloz que reserva sus sagradas manos de cocinero y combate únicamente con patadas devastadoras.", "image_url": "/cards/__sanji_one_piece_and_1_more_drawn_by_otton__0b1578756266e5ffc40e5fb01261250f.jpg"},
    {"name": "Shanks & Piratas del Pelirrojo", "card_type": CardType.LOGIA, "power": 9, "description": "La tripulación más temida y respetada del Nuevo Mundo con un poder de Haki inigualable.", "image_url": "/cards/__shanks_dracule_mihawk_benn_beckman_yasopp_and_lucky_roux_one_piece_and_1_more_drawn_by_sajima_minato__8c086959a2422599f01aa4421e0cf7fe.jpg"},
    {"name": "Shanks el Pelirrojo", "card_type": CardType.LOGIA, "power": 9, "description": "Emperador del mar. Su Haki del Conquistador es tan abrumador que quiebra la madera de los barcos a su paso.", "image_url": "/cards/__shanks_one_piece_and_1_more_drawn_by_matsumoto_akira__af73ef6f02a19773b0bda06db00b72fb.jpg"},
    {"name": "Chopper & Bonney", "card_type": CardType.ZOAN, "power": 6, "description": "El pequeño médico reno y la capitana insaciable formando un dúo veloz, alegre y formidable.", "image_url": "/cards/__tony_tony_chopper_and_jewelry_bonney_one_piece_and_1_more_drawn_by_rokushiro_koushi__sample-4e9b8d08873d0493daa9021778fa71e1.jpg"},
    {"name": "Tony Tony Chopper Médico", "card_type": CardType.ZOAN, "power": 5, "description": "Reno con la fruta Hito Hito. Se transforma en múltiples puntos anatómicos de combate para curar y defender.", "image_url": "/cards/__tony_tony_chopper_and_porche_one_piece_and_1_more_drawn_by_shinra0609__16802f9c3abc7b9294909af347530043.jpg"},
    {"name": "Trafalgar Law Cirujano de la Muerte", "card_type": CardType.PARAMECIA, "power": 8, "description": "Capitán de los Piratas Heart. Con la fruta Ope Ope crea esferas Room donde controla el espacio y la anatomía.", "image_url": "/cards/__trafalgar_law_and_kaidou_one_piece_and_1_more_drawn_by_bashikou__5dba45edb0bcb20239b801582b8c053b.jpg"},
    {"name": "Dios Usopp Tirador Legendario", "card_type": CardType.PARAMECIA, "power": 4, "description": "Francotirador prodigioso de los Sombrero de Paja armado con el tirachinas Kabuto y semillas Pop Green.", "image_url": "/cards/__usopp_one_piece_and_1_more_drawn_by_sennsu__6151d1e78f9175c4283437796a1f3245.jpg"},
    {"name": "Uta Diva del Mundo", "card_type": CardType.PARAMECIA, "power": 7, "description": "La cantante más célebre del océano. Con la fruta Uta Uta transporta las mentes de la gente a su mundo ideal.", "image_url": "/cards/__uta_one_piece_and_2_more_drawn_by_bashikou__c6d9087744515e791eff77024644a3ef.jpg"},
]


def seed_cards(db: Session) -> int:
    """Populate cards if none exist, or ensure default cards are present."""
    count = 0
    for card_data in DEFAULT_CARDS:
        existing = db.scalar(select(Card).where(Card.name == card_data["name"]))
        if not existing:
            card = Card(**card_data)
            db.add(card)
            count += 1
        else:
            # Update image_url and power if missing
            changed = False
            if existing.card_type != card_data["card_type"]:
                existing.card_type = card_data["card_type"]
                changed = True
            if existing.power != card_data["power"]:
                existing.power = card_data["power"]
                changed = True
            if existing.image_url != card_data["image_url"]:
                existing.image_url = card_data["image_url"]
                changed = True
            if existing.description != card_data["description"]:
                existing.description = card_data["description"]
                changed = True
            if changed:
                count += 1
    if count > 0:
        db.commit()
    return count


def main() -> None:
    with SessionLocal() as db:
        inserted = seed_cards(db)
        total = db.scalar(select(Card).with_only_columns(Card.id).order_by(Card.id.desc())) or 0
        print(f"Seed complete: {inserted} cards added/updated. Total cards now in database.")


if __name__ == "__main__":
    main()
