import { ArrayOf, CollectionOf, Default, Generics, Integer, MinLength } from "@tsed/schema";
import { Pageable } from "./Pageable";

@Generics("T")
export class Pagination<T> extends Pageable {
  @CollectionOf("T")
  @ArrayOf("T")
  data: T[] | null;

  @Integer()
  @MinLength(0)
  @Default(0)
  total = 0;

  constructor({ data, total, pageable }: Partial<Pagination<T>> & { pageable: Pageable }) {
    super(pageable);
    if (data) {
      this.data = data;
    }
    if (total) {
      this.total = total;
    }
  }

  @Integer()
  get pages() {
    return Math.ceil(this.total / this.size);
  }
}
